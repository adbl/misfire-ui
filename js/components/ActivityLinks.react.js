/** @jsx React.DOM */

var React = require('react');

var ActivityLinks = React.createClass({

    propTypes: {
        activity: React.PropTypes.object.isRequired,
        visible: React.PropTypes.bool.isRequired,
        onToggle: React.PropTypes.func.isRequired
    },


    _handleClick: function() {
        this.props.onToggle(this.props.activity.id);
        return false;
    },

    render: function() {
        var style = {
            width: this.props.visible ? "100%" : 0
        };

        var links = this.props.visible ? (
              <ul className="activity-links-ul pagination pagination-lg nav-justified">
                <li>
                  <a href="#" className="activity-links-a">
                    <span className="h2">
                    <span className="glyphicon glyphicon-stats"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" className="activity-links-a">
                    <span className="h2">
                    <span className="glyphicon glyphicon-list-alt"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" className="activity-links-a">
                    <span className="h2">
                    <span className="glyphicon glyphicon-pencil"></span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" className="activity-links-a">
                    <span className="h2">
                    <span className="glyphicon glyphicon-move"></span>
                    </span>
                  </a>
                </li>
              </ul>
        ) : null;

        return (
            <div className="activity-links" onClick={this._handleClick}
                style={style}>
              {links}
            </div>
        )
    }

});

module.exports = ActivityLinks;
