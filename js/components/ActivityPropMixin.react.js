/** @jsx React.DOM */
var React = require('react');

var ActivityPropMixin = function() {

    return {
        propTypes: {
            activity: React.PropTypes.object.isRequired,
        },

        hasValue: function() {
            return this.props.activity.currentValue != null;
        },

        latestValue: function() {
            return this.props.activity.currentValue ?
                this.props.activity.currentValue.value : undefined;
        },

        latestTimestamp: function() {
            return this.props.activity.currentValue ?
                this.props.activity.currentValue.timestamp : undefined;
        },

        activityType: function() {
            return this.props.activity.type;
        },

        activityValue: function() {
            return this.props.activity.value;
        }
    }
}()

module.exports = ActivityPropMixin;
