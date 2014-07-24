var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActivityConstants = require('../constants/ActivityConstants');

var ActivityActions = {
    newActivity: function(name, type, value, predefined) {
        AppDispatcher.handleViewAction({
            actionType: ActivityConstants.NEW_ACTIVITY,
            name: name,
            type: type,
            value: value,
            predefined: predefined
        })
    },
    addValue: function(activityId, timestamp, value) {
        AppDispatcher.handleViewAction({
            actionType: ActivityConstants.ADD_VALUE,
            activityId: activityId,
            timestamp: timestamp,
            value: value
        })
    }
};

module.exports = ActivityActions;
