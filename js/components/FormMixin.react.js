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
            var values = {};
            var errors = {};
            var dependees = {};
            for (var name in this.props.form) {
                var fieldProp = this.props.form[name];
                values[name] = fieldProp.defaultValue;
                errors[name] = null;
                dependees[name] = [];
            }
            // TODO catch circular dependencies
            for (var name in this.props.form) {
                var fieldProp = this.props.form[name];
                if (fieldProp.dependencies) {
                    for (var i in fieldProp.dependencies) {
                        var dependency = fieldProp.dependencies[i];
                        dependees[dependency].push(name);
                    }
                }
            }

            return {__form: {
                values: values,
                errors: errors,
                dependees: dependees
            }};
        },

        getInitialState: function() {
            return this._initialFormState();
        },

        /** Run field validation function and set/unset error state
         */
        _validateField: function(fieldName, formState) {
            var value = formState.values[fieldName];
            var validator = this.props.form[fieldName].validate;
            // TODO maybe clone formState.values
            var result = validator ? validator.call(this, value, formState.values) : true;

            // TODO: would be useful to be able to update the value form within
            // the validator or by some other callback
            if (result === true) {
                formState.errors[fieldName] = null;
                return true;
            }
            else {
                formState.errors[fieldName] = result === false ? true : result;
                return false;
            }
        },

        /** Validate field if it has error state
         */
        _revalidateField: function(fieldName, formState) {
            // TODO no more use for update?
            var error = formState.errors[fieldName];
            if (error) {
                this._validateField(fieldName, formState);
            }
        },

        /** Revalidate dependent fields
         */
        _revalidateDeps: function(fieldName, formState) {
            for (var i in formState.dependees[fieldName]) {
                var dependentField = formState.dependees[fieldName][i];
                // TODO maybe not revalidate computed since they are revalidated
                // if their computer value changes?
                this._revalidateField(dependentField, formState);
            }
        },

        // TODO do this or use underscore?
        // _withDependentFields: function(field, formState, action) {
        //     for (var i in field.dependentFields) {
        //         action.call(this, formState[field.dependentFields[i]]);
        //     }
        // }

        _updateComputed: function(updatedFieldName, formState) {
            for (var i in formState.dependees[updatedFieldName]) {
                var dependentField = formState.dependees[updatedFieldName][i];
                var compute = this.props.form[dependentField].compute;
                if (compute) {
                    this._setField(
                        dependentField, compute(formState.values), formState);
                }
            }
        },

        _setField: function(fieldName, value, formState) {
            if (value !== formState.values[fieldName]) {
                formState.values[fieldName] = value;
                this._revalidateField(fieldName, formState);
                this._updateComputed(fieldName, formState);
                this._revalidateDeps(fieldName, formState);
            }
        },

        resetForm: function() {
            this.setState(this._initialFormState());
        },

        /** Return current value of given field
         */
        getValue: function(fieldName) {
            return this.state.__form.values[fieldName];
        },

        /** Return current error of given field, or `null`
         */
        getError: function(fieldName) {
            return this.state.__form.errors[fieldName];
        },

        /** Return object with `value` and `error` properties of given field
         */
        getField: function(fieldName) {
            return {
                value: this.getValue(fieldName),
                error: this.getError(fieldName)
            }
        },

        /** Update field value in state and revalidate error state
         *
         * Only one call to this function or validateForm is allowed per event
         * loop, otherwise the second call will overwrite state changes.
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
                isValid = this._validateField(fieldName, formState) && isValid;
            }
            this.setState({__form: formState});
            return isValid ? formState.values : false;
        },

        /** Call the supplied function for each (field, err)
         * Return the list of generated errors
         */
        renderErrors: function(generateError) {
            var errorItems = [];
            for (var field in this.props.form) {
                var error = this.state.__form.errors[field];
                if (error) {
                    errorItems.push(generateError(field, error));
                }
            }
            return errorItems;
        }
    }
}()

module.exports = FormMixin;
