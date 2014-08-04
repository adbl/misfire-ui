/** @jsx React.DOM */

var React = require('react');
var ActivityActions = require('../actions/ActivityActions');
var Constants = require('../constants/ActivityConstants');
var moment = require('moment');
var FormMixin = require('./FormMixin.react');

var NoValueButton = React.createClass({

    Proptypes: {
        name: React.PropTypes.string.isRequired,
        onAddValue: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <button onClick={this._handleClick} type="button"
                className="btn btn-primary btn-lg activity-btn">
              <span>{this.props.name}</span>
            </button>
        );
    },

    _handleClick: function() {
        this.props.onAddValue(null);
    }
});

var BooleanButton = React.createClass({

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
                           (isActive ? " active" : "")}>
              <span>{this.props.name}</span>
            </button>
        );
    },

    _handleClick: function() {
        this.props.onAddValue(!this.props.activeValue);
    }
});

var PredefinedButton = React.createClass({

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
    }

});

var NumberButton = React.createClass({

    mixins: [FormMixin],

    propTypes: {
        name: React.PropTypes.string.isRequired,
        // activeValue
        onAddValue: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            form: {
                number: {
                    defaultValue: "",
                    validate: this._validateNumber
                }
            }
        }
    },

    getInitialState: function() {
        return {
            isActive: false
        }
    },

    render: function() {
        isActive = this.state.isActive;
        var number = this.getField("number");
        var activeValueString = this.props.activeValue ? ": " +
            this.props.activeValue : "";
        return (
            <div>
              <button type="button" className={
                  "btn btn-primary btn-lg activity-btn" +
                      (isActive ? " hidden" : "")}
                  onClick={this._handleActivityClick}>
                <span>{this.props.name + activeValueString}</span>
              </button>

              <div className={"input-group input-group-lg activity-btn" +
                  (isActive ? (number.error ? " has-error has-feedback" : "")
                   : " hidden")}>
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
                  <button type="button" onClick={this._handleAddValue}
                    className="btn btn-primary">
                    <span className="glyphicon glyphicon-ok" />
                  </button>
                </div>
              </div>
            </div>
        )
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.state.isActive) {
            this.refs.input.getDOMNode().focus();
        }
    },

    _handleActivityClick: function() {
        this.setState({isActive: true});
        return false;
    },

    _handleInputChange: function(event) {
        this.setField("number", event.target.value);
        return false;
    },

    _handleInputKeyDown: function(event) {
        if (event.key == "Enter") {
            this._handleAddValue();
        }
        return true;
    },

    _validateNumber: function(value) {
        if (value) {
            return parseFloat(value) !== NaN;
        }
        return false;
    },

    _handleAddValue: function() {
        if (this.validateForm()) {
            var number = this.getField("number").value;
            this.props.onAddValue(parseFloat(number));
            this.resetForm();
            this.setState({isActive: false});
        }
    },
});

var ActivityIcon = React.createClass({

    propTypes: {
        type: React.PropTypes.string.isRequired
    },

    render: function() {
        var typeIconClass = "";
        switch(this.props.type) {
        case Constants.TYPE_EVENT:
            typeIconClass = " fa-check-circle-o";
            break;
        case Constants.TYPE_TIMER:
            typeIconClass = " fa-clock-o";
            break;
        }

        return (
            <div className="activity-icon">
              <i className={"fa" + typeIconClass}></i>
            </div>
        )
    }

});

var ActivityGridItem = React.createClass({

    propTypes: {
        activity: React.PropTypes.object.isRequired,
    },

    render: function() {
        var activity = this.props.activity;

        var updatedText = "never";
        if (activity.currentValue) {
            updatedText = moment(activity.currentValue.timestamp).fromNow();
        }

        var activeValue;
        if (activity.type == Constants.TYPE_TIMER && activity.currentValue) {
            activeValue = activity.currentValue.value;
        }

        var button;

        // TODO defocus when not hover
        // TODO only show buttons on hover? then fade others

        switch (activity.value) {
        case Constants.VALUE_NONE:
            button = <NoValueButton name={activity.name}
                         onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_BOOLEAN:
            button = <BooleanButton name={activity.name}
                         activeValue={activeValue}
                         onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_NUMBER:
            button = <NumberButton name={activity.name}
                         activeValue={activeValue}
                         onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_PREDEFINED:
            button = <PredefinedButton predefined={activity.predefined}
                         activeValue={activeValue}
                         onAddValue={this._addValue} />;
            break;
        }

        return (
          <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <ActivityIcon type={activity.type} />
            {button}
            <p className="text-right">{updatedText}</p>
          </div>
        )
    },

    _addValue: function(value) {
        ActivityActions.addValue(this.props.activity.id, new Date(), value);
    },

});

module.exports = ActivityGridItem;
