/** @jsx React.DOM */

var ActivityStore = require('../stores/ActivityStore');
var ActivityActions = require('../actions/ActivityActions');
var React = require('react');
var Navbar = require('./Navbar.react');
var ActivityGrid = require('./ActivityGrid.react');
var AddActivityModal = require('./AddActivityModal.react');

function getActivityState() {
    return {
        activities: ActivityStore.getAll()
    };
}

/**
 * Controller-View
 */
var MisfireApp = React.createClass({

    getInitialState: function() {
        return getActivityState()
    },

    componentDidMount: function() {
        ActivityStore.addChangeListener(this._onChange);
        document.body.addEventListener('click', this._handleBodyClick);
    },

    componentWillUnmount: function() {
        ActivityStore.removeChangeListener(this._onChange);
        document.body.removeEventListener('click', this._handleBodyClick);
    },

    render: function() {
        return (
          <div>
            <Navbar onAddActivityClick={this._handleAddActivityClick} />
            <ActivityGrid ref="grid" activities={this.state.activities} />
            <AddActivityModal ref="add_activity_modal" show={false}
                onValidated={ActivityActions.newActivity} />
          </div>
        );
    },

    _onChange: function() {
        this.setState(getActivityState());
    },

    _handleAddActivityClick: function() {
        this.refs.add_activity_modal.show();
        return false;
    },

    _handleBodyClick: function() {
        this.refs.grid.setFocus(null);
    }
});

module.exports = MisfireApp;
