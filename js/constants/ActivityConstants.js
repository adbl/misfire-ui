var keyMirror = require('react/lib/keyMirror');

constants = keyMirror({
  NEW_ACTIVITY: null,
  ADD_VALUE: null,
});

constants.TYPE_EVENT = "event";
constants.TYPE_TIMER = "timer";

constants.VALUE_NONE = "none";
constants.VALUE_BOOLEAN = "boolean";
constants.VALUE_NUMBER = "number";
constants.VALUE_PREDEFINED = "predefined";

module.exports = constants;
