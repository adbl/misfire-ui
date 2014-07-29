var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActivityConstants = require('../constants/ActivityConstants');
var merge = require('react/lib/merge');
var uuid = require('uuid');

var CHANGE_EVENT = 'change';

var _activities = {};

function newActivity(name, type, value, predefined) {
    id = uuid.v4();
    var newActivity = {
        id: id,
        name: name,
        type: type,
        value: value,
        predefined: predefined
    }
    console.debug("[sync-queue] newActivity: " + JSON.stringify(newActivity));
    // TODO add to sync queue
    _activities[id] = newActivity;
}

function addValue(activityId, timestamp, value) {
    var activity = _activities[activityId];
    var newValue = {
        id: uuid.v4(),
        timestamp: timestamp,
        value: value
    };
    console.debug("[sync-queue] addValue: " + JSON.stringify(newValue));
    // TODO add to sync queue
    activity.currentValue = newValue;
}

var ActivityStore = merge(EventEmitter.prototype, {

    /**
     * TODO:
     *   - order argument?
     */
    getAll: function() {
        return _activities;
    },

    // TODO should be private?
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register to handle all updates
// TODO keep AppDispatcher index?
AppDispatcher.register(function(payload) {
  var action = payload.action;
  var text;

  switch(action.actionType) {
    case ActivityConstants.NEW_ACTIVITY:
      newActivity(action.name, action.type, action.value, action.predefined);
      ActivityStore.emitChange();
      break;
    case ActivityConstants.ADD_VALUE:
      addValue(action.activityId, action.timestamp, action.value);
      ActivityStore.emitChange();
      break;
  }

  return true; // No errors.  Needed by promise in Dispatcher.
});

module.exports = ActivityStore;
