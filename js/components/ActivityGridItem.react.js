/** @jsx React.DOM */

var React = require('react');
var ActivityActions = require('../actions/ActivityActions');
var Constants = require('../constants/ActivityConstants');
var moment = require('moment');

/**
 * TODO:
 *   - refactor into multiple components
 */
var ActivityGridItem = React.createClass({

    propTypes: {
        activity: React.PropTypes.object.isRequired,
    },

    render: function() {
        var activity = this.props.activity;
        var typeIconClass = "";
        var buttonClass = "";
        var updatedText = "never";

        switch(activity.type) {
        case Constants.TYPE_EVENT:
            typeIconClass = " fa-check-circle-o";
            break;
        case Constants.TYPE_TIMER:
            typeIconClass = " fa-clock-o";
            break;
        }

        if (activity.type == Constants.TYPE_TIMER && activity.currentValue
            && activity.currentValue.value == true) {
            buttonClass=" active";
        }

        if (activity.currentValue) {
            updatedText = moment(activity.currentValue.timestamp).fromNow();
        }

        return (
          <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <div className="activity-icon">
              <i className={"fa" + typeIconClass}></i>
            </div>
              <button onClick={this._handleClick} type="button" className={"btn btn-primary btn-lg col-xs-9 activity-btn" + buttonClass}>
              <span>{activity.name}</span>
            </button>
            <p className="text-right">{updatedText}</p>
          </div>
        )
    },

    _handleClick: function() {
        var value = null;
        var activity = this.props.activity;
        switch(activity.type) {
        case Constants.TYPE_EVENT:
            value = null;       // NOTE has changed
            break;
        case Constants.TYPE_TIMER:
            value = true;
            if (activity.currentValue) {
                value = !activity.currentValue.value
            }
        }
        ActivityActions.addValue(this.props.key, new Date(), value);
    }

});

module.exports = ActivityGridItem;
