/** @jsx React.DOM */

var React = require('react');
var ActivityGridItem = require('./ActivityGridItem.react');

var ActivityGrid = React.createClass({

    getInitialState: function() {
        return { focusedItemKey: null,
                 showLinksActivityId: null
               };
    },

    render: function() {
        var activities = this.props.activities;
        var activityNodes = [];
        var numAdded = 0;
        for (var id in activities) {
            activity = activities[id];
            // ternary
            var hasFocus = this.state.focusedItemKey ?
                id === this.state.focusedItemKey : null;
            activityNodes.push(
                <ActivityGridItem activity={activity} key={id}
                    hasFocus={hasFocus}
                    onFocus={this._setFocus}
                    hasLinks={id === this.state.showLinksActivityId}
                    onToggleLinks={this._toggleLinks} />
            )
            numAdded++;
            if (numAdded % 2 == 0) {
                activityNodes.push(
                    <div key={numAdded.toString() + "-sm"}
                        className="clearfix visible-sm-block" />
                )
            }
            if (numAdded % 3 == 0) {
                activityNodes.push(
                    <div key={numAdded.toString() + "-md"}
                        className="clearfix visible-md-block" />
                )
            }
            if (numAdded % 4 == 0) {
                activityNodes.push(
                    <div key={numAdded.toString() + "-lg"}
                        className="clearfix visible-lg-block" />
                )
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

    deselect: function() {
        this._setFocus(null);
        this._toggleLinks(null);
    },

    _toggleLinks: function(activityId) {
        if (activityId === this.state.showLinksActivityId) {
            activityId = null;
        }
        this.setState({showLinksActivityId: activityId});
    },

    _setFocus: function(item) {
        // TODO why all this?
        if (!item && this.state.focusedItemKey) {
            this.setState({focusedItemKey: null});
            return true;
        }
        else if (item && item.props.key !== this.state.focusedItemKey) {
            this.setState({focusedItemKey: item.props.key});
            return true;
        }
        return false;
    }

});

module.exports = ActivityGrid;
