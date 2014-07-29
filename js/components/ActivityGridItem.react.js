/** @jsx React.DOM */

var React = require('react');
var ActivityActions = require('../actions/ActivityActions');
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
        case "event":
            typeIconClass = " fa-check-circle-o";
            break;
        case "duration":
            typeIconClass = " fa-clock-o";
            break;
        }

        if (activity.type == "duration" && activity.currentValue
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
        case "event":
            value = null;       // NOTE has changed
            break;
        case "duration":
            value = true;
            if (activity.currentValue) {
                value = !activity.currentValue.value
            }
        }
        ActivityActions.addValue(this.props.key, new Date(), value);
    }

});

module.exports = ActivityGridItem;
