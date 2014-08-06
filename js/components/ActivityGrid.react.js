/** @jsx React.DOM */

var React = require('react');
var ActivityGridItem = require('./ActivityGridItem.react');

var ActivityGrid = React.createClass({

    getInitialState: function() {
        return { focusedItemKey: null };
    },

    render: function() {
        var activities = this.props.activities;
        var activityNodes = [];
        var numAdded = 0;
        for (var id in activities) {
            activity = activities[id];
            var hasFocus = null;
            if (this.state.focusedItemKey) {
                hasFocus = id === this.state.focusedItemKey;
            }
            activityNodes.push(
                <ActivityGridItem activity={activity} key={id}
                    hasFocus={hasFocus} onFocus={this.setFocus} />
            )
            numAdded++;
            if (numAdded % 2 == 0) {
                activityNodes.push(<div className="clearfix visible-sm-block" />)
            }
            if (numAdded % 3 == 0) {
                activityNodes.push(<div className="clearfix visible-md-block" />)
            }
            if (numAdded % 4 == 0) {
                activityNodes.push(<div className="clearfix visible-lg-block" />)
            }
        }
        return (
            <div className="container">
              <div className="row">
                {activityNodes}
              </div>
            </div>
        )
    },

    setFocus: function(item) {
        var focused = item ? item.props.key : null;
        this.setState({focusedItemKey: focused});
    }

});

module.exports = ActivityGrid;
