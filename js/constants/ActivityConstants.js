var keyMirror = require('react/lib/keyMirror');

constants = keyMirror({
  NEW_ACTIVITY: null,
  ADD_VALUE: null,
});

constants.TYPE_EVENT = "event";
constants.TYPE_TIMER = "timer";

module.exports = constants;
