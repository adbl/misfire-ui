/** @jsx React.DOM */

var React = require('react');
var ActivityGridItem = require('./ActivityGridItem.react');

var ActivityGrid = React.createClass({

    render: function() {
        var activities = this.props.activities;
        var activityNodes = [];
        for (var id in activities) {
            activity = activities[id];
            activityNodes.push(
              <ActivityGridItem activity={activity} key={id} />)
        }
        return (
            <div className="container">
              <div className="row">
                {activityNodes}
              </div>
            </div>
        )
    }

});

module.exports = ActivityGrid;
