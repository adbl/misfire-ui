/** @jsx React.DOM */

var React = require('react');
var FormMixin = require('./FormMixin.react');

var NoValue = React.createClass({

    Proptypes: {
        name: React.PropTypes.string.isRequired,
        onAddValue: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <button onClick={this._handleClick} type="button"
                className="btn btn-primary btn-lg activity-btn"
                disabled={this.props.disabled}>
              <span>{this.props.name}</span>
            </button>
        );
    },

    _handleClick: function() {
        this.props.onAddValue(null);
        return false;
    }
});

var OnOff = React.createClass({

    Proptypes: {
        activeValue: React.PropTypes.bool,
        name: React.PropTypes.string.isRequired,
        onAddValue: React.PropTypes.func.isRequired
    },

    render: function() {
        var isActive = this.props.activeValue === true;
        return (
            <button onClick={this._handleClick} type="button"
                className={"btn btn-primary btn-lg activity-btn"  +
                           (isActive ? " active" : "")}
                disabled={this.props.disabled}>
              <span>{this.props.name}</span>
            </button>
        );
    },

    _handleClick: function() {
        this.props.onAddValue(!this.props.activeValue);
        return false;
    }
});

var Predefined = React.createClass({

    Proptypes: {
        predefined: React.PropTypes.array.isRequired,
        // activeValue: array[string]
        onAddValue: React.PropTypes.func.isRequired
    },

    render: function() {
        var predefined = this.props.predefined;
        var groupButtons = [];
        for (var i in predefined) {
            predefinedValue = predefined[i];
            isActive = predefinedValue === this.props.activeValue;

            groupButtons.push(
                <div className="btn-group btn-group-lg" key={predefinedValue}>
                  <button type="button" name={predefinedValue}
                      className={"btn btn-primary btn-lg" +
                                 (isActive ? " active" : "")}
                      disabled={this.props.disabled}
                      value={predefinedValue}
                      onClick={this._handleClick}>
                    {predefinedValue}
                  </button>
                </div>
            )
        }

        return (
            <div className="btn-group btn-group-justified activity-btn">
              {groupButtons}
            </div>
        );
    },

    _handleClick: function(event) {
        this.props.onAddValue(event.target.value);
        return false;
    }

});

var Number = React.createClass({

    mixins: [FormMixin],

    propTypes: {
        name: React.PropTypes.string.isRequired,
        hasFocus: React.PropTypes.bool,
        onFocus: React.PropTypes.func.isRequired,
        // activeValue
        onAddValue: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            form: {
                number: {
                    defaultValue: "",
                    validate: function(number) {
                        console.debug(number);
                        return parseFloat(number) !== NaN;
                    }
                }
            }
        }
    },

    render: function() {
        isActive = this.props.hasFocus;
        var number = this.getField("number");
        var activeValueString = this.props.activeValue !== null ?
            ": " + this.props.activeValue.toString() : "";
        return (
            <div>
              <button type="button" className={
                  "btn btn-primary btn-lg activity-btn" +
                      (isActive ? " hidden" : "")}
                  disabled={this.props.disabled}
                  onClick={this._handleActivityClick}>
                <span>{this.props.name + activeValueString}</span>
              </button>

              <div className={"input-group input-group-lg activity-btn" +
                  (isActive ? (number.error ? " has-error has-feedback" : "")
                   : " hidden")} onClick={this._handleOtherClick}>
                <input type="number" ref="input" value={number.value}
                    onChange={this._handleInputChange}
                    onKeyDown={this._handleInputKeyDown}
                    className="form-control"
                    placeholder={this.props.name}/>
                <span className={
                    "glyphicon glyphicon-remove form-control-feedback " +
                        "addon-feedback-lg" + (number.error ? "" : " hidden")}>
                </span>
                <div className="input-group-btn">
                  <button type="button" onClick={this._handleAddClick}
                    className="btn btn-primary">
                    <span className="glyphicon glyphicon-ok" />
                  </button>
                </div>
              </div>
            </div>
        )
    },

    _addValue: function() {
        result = this.validateForm();
        if (result) {
            this.props.onAddValue(parseFloat(result.number));
            this.resetForm();
            this.props.onFocus(false);
        }
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.hasFocus) {
            this.refs.input.getDOMNode().focus();
        }
    },

    _handleActivityClick: function(event) {
        this.props.onFocus(true);
        return false;
    },

    _handleOtherClick: function() {
        return false; // so we don't loose focus
    },

    _handleInputChange: function(event) {
        this.setField("number", event.target.value);
        return false;
    },

    _handleInputKeyDown: function(event) {
        if (event.key == "Enter") {
            this._addValue();
        }
        return true;
    },

    _handleAddClick: function() {
        this._addValue();
        return false;
    },
});

module.exports = {
    NoValue: NoValue,
    OnOff: OnOff,
    Predefined: Predefined,
    Number: Number
};
