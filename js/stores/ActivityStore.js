var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActivityConstants = require('../constants/ActivityConstants');
var merge = require('react/lib/merge');
var uuid = require('uuid');
var moment = require('moment');

var CHANGE_EVENT = 'change';

function storeLocal(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
}

function loadLocal(key) {
    var data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

function loadValue(valueId) {
    value = loadLocal("value-" + valueId);
    value.timestamp = moment(value.timestamp, moment.ISO_8601);
    return value;
}

function storeValue(value) {
    var store = _.clone(value);
    store.timestamp = value.timestamp.toISOString();
    storeLocal("value-" + value.id, store);
}

function loadActivity(activityId) {
    var activity = loadLocal("activity-" + activityId);
    var valueId = activity._currentValueId;
    if (valueId) {
        activity.currentValue = loadValue(valueId);
        delete activity._currentValueId;
    }
    return activity;
}

function storeActivity(activity) {
    var store = _.clone(activity);

    if (activity.currentValue) {
        store._currentValueId = activity.currentValue.id;
        delete store.currentValue;
    }
    storeLocal("activity-" + activity.id, store);
}

function loadActivities() {
    var activityList = loadLocal("activities");
    if (activityList) {
        var activities = {};
        for (var i in activityList) {
            var activityId = activityList[i];
            activities[activityId] = loadActivity(activityId);
        }
        return activities;
    }
    return null;
}

function newActivity(name, type, value, predefined) {
    var activityId = uuid.v4(); // check conflicts?
    var valueListId = uuid.v4(); // check conflicts?
    var newActivity = {
        id: activityId,
        name: name,
        type: type,
        value: value,
        predefined: predefined,
        _valueListId: valueListId
    }
    // TODO add to sync queue
    storeActivity(newActivity);
    storeLocal(valueListId, []);
    activityList = loadLocal("activities");
    activityList.push(activityId);
    storeLocal("activities", activityList);

    _activities[activityId] = newActivity;
}

function addValue(activityId, timestamp, value) {
    var activity = _activities[activityId];
    var valueId = uuid.v4();    // check conflicts?
    var newValue = {
        id: valueId,
        timestamp: timestamp,
        value: value
    };
    // TODO add to sync queue
    storeValue(newValue);
    var values = loadLocal(activity._valueListId);
    values.push(valueId);
    storeLocal(activity._valueListId, values);

    activity.currentValue = newValue;
    storeActivity(activity);
}

// TODO should wait until UI has been loaded?
var _activities;

function init() {
    var meta = loadLocal("meta");
    var activities;
    if (meta) {
        if (meta.version == 1) {
            activities = loadActivities();
        }
        else {
            console.error("unsupported version in localStorage: ", meta);
        }
    }
    if (!meta) {
        storeLocal("meta", {version: 1, init: moment().toISOString()});
    }

    if (!activities) {
        storeLocal("activities", []);
        activities = {};
    }
    _activities = activities;
}

init();

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
