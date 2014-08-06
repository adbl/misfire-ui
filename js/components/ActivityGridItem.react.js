/** @jsx React.DOM */

var React = require('react');
var ActivityActions = require('../actions/ActivityActions');
var Constants = require('../constants/ActivityConstants');
var moment = require('moment');

var ActivityButton = require('./ActivityButton.react');

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
        hasFocus: React.PropTypes.bool,
        onFocus: React.PropTypes.func.isRequired
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

        var fade = false;
        if (this.props.hasFocus !== null) {
            fade = !this.props.hasFocus;
        }

        // transferPropsTo(button) ??? read up
        var button;
        switch (activity.value) {
        case Constants.VALUE_NONE:
            button = <ActivityButton.NoValue name={activity.name}
                         disabled={fade} onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_BOOLEAN:
            button = <ActivityButton.OnOff name={activity.name}
                         activeValue={activeValue}
                         disabled={fade} onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_NUMBER:
            button = <ActivityButton.Number name={activity.name}
                         hasFocus={this.props.hasFocus}
                         onFocus={this._handleFocused}
                         activeValue={activeValue}
                         disabled={fade} onAddValue={this._addValue} />;
            break;
        case Constants.VALUE_PREDEFINED:
            button = <ActivityButton.Predefined predefined={activity.predefined}
                         activeValue={activeValue}
                         disabled={fade} onAddValue={this._addValue} />;
            break;
        }

        return (
          <div className={"col-xs-12 col-sm-6 col-md-4 col-lg-3" +
                          (fade ? " fade" : "")}>
            <ActivityIcon type={activity.type} />
            {button}
            <p className="text-right">{updatedText}</p>
          </div>
        )
    },

    _handleFocused: function(isFocused) {
        this.props.onFocus(isFocused ? this : null);
    },

    _addValue: function(value) {
        ActivityActions.addValue(this.props.activity.id, new Date(), value);
    },

});

module.exports = ActivityGridItem;
