var React = require('react');

var FormMixin = function() {
    return {
        propTypes: {
            // TODO fields: ...
        },

        _fieldOrder: function(form) {
            var frm = form;

            var fields = {};
            var order = [];
            for (var name in frm) {
                order.push(name);
                fields[name] = {
                    deps: frm[name].dependencies,
                    depth: null
                };
            }
            for (var name in frm) {
                this._calculateDepth(name, fields, {}, 0);
            }

            order.sort(function(a, b) {
                return fields[a].depth - fields[b].depth
            });
            return order;
        },

        _calculateDepth: function(name, fields, seen, depth) {
            if (name in seen) {
                throw "circular dependency detected for: " + name;
            }
            seen[name] = true;

            var deps = fields[name].deps;
            if (fields[name].depth !== null) {
                return fields[name].depth;
            }

            if (deps && deps.length) {
                depth += 1;
                var longestDepsDepth = 0;
                for (var i in deps) {
                    var depsDepth = this._calculateDepth(deps[i], fields, seen, 0);
                    if (depsDepth > longestDepsDepth) {
                        longestDepsDepth = depsDepth;
                    }
                }
                depth += longestDepsDepth;
            }
            fields[name].depth = depth;
            return depth;
        },

        _initialFormState: function() {
            if (!this.props.form) {
                throw "Missing `form` prop";
            }
            var order = this._fieldOrder(this.props.form);
            var values = {};
            var dependees = {};
            for (var name in this.props.form) {
                var fieldProp = this.props.form[name];
                values[name] = fieldProp.defaultValue;
                dependees[name] = [];
            }
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
                order: order,
                values: values,
                errors: {},
                warnings: {},
                dependees: dependees
            }};
        },

        getInitialState: function() {
            return this._initialFormState();
        },

        _withFields: function(fn, formState, fieldsObject) {
            if (fieldsObject === undefined) {
                // TODO risk bcause referencing this.state.__form?
                fieldsObject = this.getFields();
            }

            for (var i in formState.order) {
                var fieldName = formState.order[i];
                if (fieldName in fieldsObject) {
                    // TODO bind or not?
                    fn.call(this, fieldName, fieldsObject[fieldName]);
                }
            }
        },

        /** Run field validation function and set/unset error state
         */
        _validateField: function(fieldName, ignoreSameWarning, formState) {
            var value = formState.values[fieldName];
            var validator = this.props.form[fieldName].validate;
            // TODO maybe clone formState.values
            var result = validator ?
                validator.call(this, value, formState.values) : true;

            // TODO: would be useful to be able to update the value form within
            // the validator or by some other callback
            if (result === true) {
                result = {};
            }
            else if (result === false) {
                result = {error: true};
            }

            if (ignoreSameWarning && result.warning &&
                result.warning === formState.warnings[fieldName]) {
                console.debug("ignoring same warning", fieldName, result.warning);
                delete result.warning;
            }

            if (result.error) {
                formState.errors[fieldName] = result.error;
            }
            else {
                delete formState.errors[fieldName];
            }

            if (result.warning) {
                formState.warnings[fieldName] = result.warning;
            }
            else {
                delete formState.warnings[fieldName];
            }

            return result;
        },

        /** Validate field if it has error state
         */
        _revalidateField: function(fieldName, formState) {
            if (formState.errors[fieldName] || formState.warnings[fieldName]) {
                this._validateField(fieldName, false, formState);
            }
        },

        /** Revalidate dependent fields
         */
        _revalidateDeps: function(fieldName, formState) {
            // TODO use _withFields?
            for (var i in formState.dependees[fieldName]) {
                var dependentField = formState.dependees[fieldName][i];
                if (!this.props.form[dependentField].compute) {
                    this._revalidateField(dependentField, formState);
                }
            }
        },

        _updateComputed: function(updatedFieldName, formState) {
            // TODO use _withFields?
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

        _setFields: function(change, formState) {
            this._withFields(function(fieldName, newValue) {
                this._setField(fieldName, newValue, formState);
            }, formState, change)
        },

        /** Reset form to initial state
         */
        resetForm: function() {
            this.setState(this._initialFormState());
        },

        /** Return current value of given field
         */
        getValue: function(fieldName) {
            return this.state.__form.values[fieldName];
        },

        /** Return current error of given field, or `undefined`
         */
        getError: function(fieldName) {
            return this.state.__form.errors[fieldName];
        },

        /** Return current warning of given field, or `undefined`
         */
        getWarning: function(fieldName) {
            return this.state.__form.warnings[fieldName];
        },

        /** Return object with `value` and `error` properties of given field
         */
        getField: function(fieldName) {
            return {
                value: this.getValue(fieldName),
                error: this.getError(fieldName),
                warning: this.getWarning(fieldName)
            }
        },

        /** Return object with field names as keys and `getField()` as value
         */
        getFields: function(formState) {
            var fieldsObject = {};
            for (var fieldName in this.props.form) {
                fieldsObject[fieldName] = this.getField(fieldName);
            }
            return fieldsObject;
        },

        /** Update field value in state and revalidate error state
         *
         * Only one call to this function, setFields or validateForm is allowed
         * per event loop, otherwise the second call will overwrite state
         * changes.
         *
         * TODO:
         *   - value can be a function which takes current value
         */
        setField: function(fieldName, value) {
            var change = {};
            change[fieldName] = value;
            this.setFields(change);
        },

        /** Update field values in state and revalidate error state
         *
         * Only one call to this function, setField or validateForm is allowed
         * per event loop, otherwise the second call will overwrite state
         * changes.
         *
         * TODO:
         * - only revalidate a field once per setFields operation.
         */
        setFields: function(change) {
            // TODO check change is an object
            var formState = _.cloneDeep(this.state.__form);
            this._setFields(change, formState);
            this.setState({__form: formState});
        },

        /** Validate all fields and return the grand result
         *
         * Return `false` if some field has error or warning, otherwise return
         * object with field names as keys and their validated values.
         *
         * A field with the same warning for two consecutive calls will be valid
         * the second call.
         *
         * Only one call to this function or setField is allowed per event
         * handler, otherwise the second call will overwrite state changes.
         *
         * TODO:
         *   - Explicit handling of form state, supports multiple calls per
         *     event loop
         *   - optimistic validation (success only) green checkbox
         *   - public function can take fieldName?
         */
        validateForm: function() {
            var formState = _.cloneDeep(this.state.__form);
            var isValid = true;

            this._withFields(function(fieldName) {
                var fieldResult = this._validateField(
                    fieldName, true, formState);
                isValid = isValid && !fieldResult.error && !fieldResult.warning;
            }, formState);

            this.setState({__form: formState});
            return isValid ? formState.values : false;
        },

        /** Call the supplied function for each (field, err)
         * Return the list of generated errors
         */
        renderErrors: function(generateError) {
            var errorItems = [];
            for (var field in this.props.form) {
                var error = this.getError(field);
                if (error) {
                    errorItems.push(generateError(field, error));
                }
            }
            return errorItems;
        },

        /** Call the supplied function for each (field, warning)
         * Return the list of generated errors
         */
        renderWarnings: function(generateWarning) {
            var warningItems = [];
            for (var field in this.props.form) {
                var warning = this.getWarning(field);
                if (warning) {
                    warningItems.push(generateWarning(field, warning));
                }
            }
            return warningItems;
        }
    }
}()

module.exports = FormMixin;
