var React = require('react');

var FormMixin = function() {
    return {
        propTypes: {
            // TODO fields: ...
        },

        _initialFormState: function() {
            if (!this.props.form) {
                throw "Missing `form` prop";
            }
            fields = {};
            for (var name in this.props.form) {
                fieldProp = this.props.form[name];
                fields[name] = {
                    value: fieldProp.defaultValue,
                    error: null,
                    dependentFields: []
                }
            }
            // TODO catch circular dependencies
            for (var name in this.props.form) {
                fieldProp = this.props.form[name];
                if (fieldProp.dependencies) {
                    for (var i in fieldProp.dependencies) {
                        dependency = fieldProp.dependencies[i];
                        fields[dependency].dependentFields.push(name);
                    }
                }
            }

            return {__form: fields};
        },

        getInitialState: function() {
            return this._initialFormState();
        },

        /** Run field validation function and set/unset error state
         *
         * TODO: can take a field with added `name` attribute
         */
        _validateField: function(fieldName, fieldState, update) {
            if (update === undefined) {
                update = {};
            }

            var value = fieldState.value;
            var validator = this.props.form[fieldName].validate;
            var result = validator ? validator.call(this, value, update) : true;

            // TODO: would be useful to be able to update the value form within
            // the validator or by some other callback
            if (result === true) {
                fieldState.error = null;
                return true;
            }
            else {
                fieldState.error = result === false ? true : result;
                return false;
            }
        },

        /** Validate field if it has error state
         *
         * TODO: can take a field with added `name` attribute
         */
        _revalidateField: function(fieldName, fieldState, update) {
            var error = fieldState.error;
            if (error) {
                this._validateField(fieldName, fieldState, update);
            }
        },

        /** Revalidate dependent fields
         */
        _revalidateDeps: function(fieldName, formState) {
            var fieldState = formState[fieldName];
            var dependentFields = fieldState.dependentFields;
            update = {};
            update[fieldName] = fieldState.value;
            for (var i in dependentFields) {
                var dependentField = dependentFields[i];
                // TODO maybe not revalidate computed since they are revalidated
                // if their computer value changes?
                this._revalidateField(
                    dependentField, formState[dependentField], update);
            }
        },

        // TODO do this or use underscore?
        // _withDependentFields: function(field, formState, action) {
        //     for (var i in field.dependentFields) {
        //         action.call(this, formState[field.dependentFields[i]]);
        //     }
        // }

        _setField: function(fieldName, value, formState) {
            var fieldState = formState[fieldName];
            if (value !== fieldState.value) {
                fieldState.value = value;
                this._revalidateField(fieldName, fieldState);
                this._updateComputed(fieldName, formState);
                this._revalidateDeps(fieldName, formState);
            }
        },

        // TODO pass fieldState around for updates + add name attribute
        _updateComputed: function(updatedFieldName, formState) {
            var updatedField = formState[updatedFieldName];

            var update = {};
            update[updatedFieldName] = updatedField.value;

            for (var i in updatedField.dependentFields) {
                var dependentField = updatedField.dependentFields[i];
                var compute = this.props.form[dependentField].compute;
                if (compute) {
                    this._setField(
                        dependentField, compute.call(this, update), formState);
                }
            }
        },

        resetForm: function() {
            this.setState(this._initialFormState());
        },

        /** Return current state of given field
         *
         * TODO:
         *   - use getValue / getError instead or strip private stuff
         */
        getField: function(fieldName) {
            return this.state.__form[fieldName];
        },

        /** Update field value in state and revalidate error state
         *
         * Only one call to this function or validateForm is allowed per event
         * handler, otherwise the second call will overwrite state changes.
         *
         * TODO:
         *   - can take {f1: v1, f2: v2} to allow updating multiple fields
         *   - updateValue takes function(currentValue) { return newValue },
         *     setValue takes value
         */
        setField: function(fieldName, value) {
            var formState = _.cloneDeep(this.state.__form);
            this._setField(fieldName, value, formState);
            this.setState({__form: formState});
        },

        /** Validate all fields and return the grand result
         *
         * Only one call to this function or setField is allowed per event
         * handler, otherwise the second call will overwrite state changes.
         *
         * TODO:
         *   - Interface could be more explicit and not touch this.state or
         *     setState at all, (node-formidable?)
         *   - optimistic validation (success only) green checkbox
         *   - public function can take fieldName?
         */
        validateForm: function(options) {
            var formState = _.cloneDeep(this.state.__form);
            var isValid = true;
            for (var fieldName in this.props.form) {
                isValid = this._validateField(fieldName, formState[fieldName])
                    && isValid;
            }
            this.setState({__form: formState});
            return isValid;
        },

        /** Call the supplied function for each (field, err)
         * Return the list of generated errors
         */
        renderErrors: function(generateError) {
            var errorItems = [];
            for (var field in this.props.form) {
                var error = this.state.__form[field].error;
                if (error) {
                    errorItems.push(generateError(field, error));
                }
            }
            return errorItems;
        }
    }
}()

module.exports = FormMixin;
