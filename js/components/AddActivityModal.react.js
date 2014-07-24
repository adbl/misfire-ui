/** @jsx React.DOM */

var React = require('react');
var BootstrapModalMixin = require('./BootstrapModalMixin.react');
var FormMixin = require('./FormMixin.react');

var BsSelectButton = React.createClass({

    propTypes: {
        name: React.PropTypes.string,
        onSelected: React.PropTypes.func.isRequired,
        // selectedValue (isSelected)
        // value: React.PropTypes.any?
        className: React.PropTypes.string,
        selectedClass: React.PropTypes.string,
        unselectedClass: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            type: "button",
            className: "btn",
            selectedClass: "btn-primary",
            unselectedClass: "btn-default"
        }
    },

    render: function() {
        isSelected = this.props.selectedValue === this.props.value;
        className = this.props.className + " " + (
            isSelected ? this.props.selectedClass : this.props.unselectedClass);
        // expect single child and set the stuff
        return (
            <button type={this.props.type}
                    name={this.props.name}
                    className={className}
                    onClick={this._handleOnClick}>
              {this.props.children}
            </button>
        )
    },

    _handleOnClick: function() {
        this.props.onSelected(this);
        return false;
    }

});

var LABEL = "label";
var TYPE = "type";
var PREDEFINED = "predefined";

var LABEL_MISSING = "label-missing";
var TYPE_MISSING = "type-missing";
var PREDEFINED_TOO_FEW = "predefined-too-few";

/* TODO
 *   - dont clear form on cancel until modal is hidden
 *     Should be done via onCancel callback in parent?
 *     Or in local callback onHidden + wasCancelled state, however then parent
 *     looses control...
 *   - experiment with OK input state during onChange and glyphicon checker
 *   - also keep Add button be disabled until all fields are validated
 *   - refactor radio input to separate component
 *   - refactor form group into separate component
 *   - create BootstrapModal component with header, body and footer props
 *   - check diffs from old modal in index.html
 */
var AddActivityModal = React.createClass({

    mixins: [BootstrapModalMixin, FormMixin],

    getDefaultProps: function() {
        return {
            fields: {
                label: {
                    defaultValue: "",
                    validate: this._validateLabel
                },
                type: {validate: this._validateType},
                value: {
                    compute: this._computeValue,
                    dependencies: ["type", "eventValue", "timerValue"]
                },
                predefined: {
                    defaultValue: [],
                    validate: this._validatePredefinedOptions,
                    dependencies: ["value"]
                },
                eventValue: {defaultValue: "none"},
                timerValue: {defaultValue: "boolean"}
            }
        }
    },

    render: function() {
        errorItems = this.renderErrors(function(field, error) {
            var text = null;
            var href = "#add-activity-group-" + field;
            switch (error) {
            case LABEL_MISSING:
                text = <span>Enter a <a href={href}>label</a> text</span>;
                break;
            case TYPE_MISSING:
                text = <span>Choose activity <a href={href}>type</a></span>;
                break;
            case PREDEFINED_TOO_FEW:
                text = <span>Add at least two <a href={href}>predefined</a> values</span>;
                break;
            }
            return <li key={error}>{text}</li>;
        });

        var label = this.getField("label");
        var type = this.getField("type");
        var value = this.getField("value");
        var eventValue = this.getField("eventValue");
        var timerValue = this.getField("timerValue");
        var predefined = this.getField("predefined");

        var predefinedItems = [];
        for (var i in predefined.value) {
            option = predefined.value[i];
            predefinedItems.push(<li key={option}>{option}</li>);
        }

        return (
            <div className="modal fade">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    {this.renderCloseButton()}
                    <h4 className="modal-title">New Activity</h4>
                  </div>
                  <div className="modal-body">

                    <p>An activity is a button that records the time and other
 things when clicked (which is called to <strong>activate</strong>). This allows you to learn more about stuff that happens, like: how often or when does it happen, or how long does it take.</p>
                    <p>The appearence and behaviour will depend on the options you choose here.</p>


                    <div id="add-activity-group-label" className=
                         {"form-group" + (label.error ?
                                          " has-error has-feedback" : "")} >
                      <label className="control-label h3"
                             htmlFor="add-activity-label">Label <small>- Text that is displayed on the activity button</small></label>
                      <input type="text" value={label.value}
                          onChange={this._handleLabelChange}
                          className="form-control input-lg"
                          id="add-activity-label"
                          placeholder="Activity label text" />
                      <span className=
                            {"glyphicon glyphicon-remove form-control-feedback h3-label-feedback"
                             + (label.error ? "" : " hidden")}></span>
                    </div>


                    <div id="add-activity-group-type" className=
                         {"form-group" +
                          (type.error ? " has-error" : "")}>
                      <label className="control-label h3">Type <small>- What happens when you activate it</small></label>

                      <div className="row">
                        <div className="col-xs-6">
                          <div>
                            <label className=
                                 {"btn btn-circle center-block" +
                                  (type.value == 'event' ? " btn-primary"
                                   : " btn-default text-primary")}>
                              <span className={"glyphicon glyphicon-ok-circle" +
                                               (type.value == "event" ? ""
                                                : " text-primary")} />
                              <input type="radio" name="type"
                                     value="event" className="hidden"
                                     onClick={this._handleTypeClick} />
                            </label>
                            <br />
                          </div>
                          <div>
                            <span><strong>Event</strong> - record the current time together with an optional value. This allows you to say that something happens at certain points in time.</span>
                          </div>
                        </div>

                        <div className="col-xs-6">
                          <div>
                            <label className=
                                 {"btn btn-circle center-block" +
                                  (type.value == 'timer' ? " btn-primary"
                                   : " btn-default")}>
                              <span className={"glyphicon glyphicon-time"
                                               + (type.value == "timer" ?
                                                  "" : " text-primary")} />
                              <input type="radio" name="type"
                                     value="timer" className="hidden"
                                     onClick={this._handleTypeClick} />
                            </label>
                            <br />
                       </div>
                          <div>
                            <span><strong>Timer</strong> - record the current time and a value, which will be active until another value is activated. This allows you to say when something starts and stops, or, how much time it takes.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={"form-group" + (
                        type.value == "event" ? "" : " hidden")}>
                      <label className="control-label h3">Event Value</label>
                      <p>Do you want to assign a certain kind of value each time it is activated?</p>

                      <div className="btn-group btn-group-justified">
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="eventValue" value="none"
                              selectedValue={eventValue.value}
                              onSelected={this._handleValueSelected}>
                            No
                          </BsSelectButton>
                        </div>
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="eventValue" value="number"
                              selectedValue={eventValue.value}
                              onSelected={this._handleValueSelected}>
                            Number
                          </BsSelectButton>
                        </div>
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="eventValue" value="predefined"
                              selectedValue={eventValue.value}
                              onSelected={this._handleValueSelected}>
                            Predefined...
                          </BsSelectButton>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-4">
                          You just click the button
                        </div>
                        <div className="col-xs-4">
                          You are asked to input a number
                        </div>
                        <div className="col-xs-4">
                          Each value is a separate button
                        </div>
                      </div>
                    </div>


                    <div className={"form-group" + (
                        type.value == "timer" ? "" : " hidden")}>
                      <label className="control-label h3">Timer Value</label>
                      <p>What kind of value should be assigned when it is activated?</p>

                      <div className="btn-group btn-group-justified">
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="timerValue" value="boolean"
                              selectedValue={timerValue.value}
                              onSelected={this._handleValueSelected}>
                            On / Off
                          </BsSelectButton>
                        </div>
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="timerValue" value="number"
                              selectedValue={timerValue.value}
                              onSelected={this._handleValueSelected}>
                            Number
                          </BsSelectButton>
                        </div>
                        <div className="btn-group btn-group-lg">
                          <BsSelectButton name="timerValue" value="predefined"
                              selectedValue={timerValue.value}
                              onSelected={this._handleValueSelected}>
                            Predefined...
                          </BsSelectButton>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-4">
                          Turns On when activated, and Off the next time
                        </div>
                        <div className="col-xs-4">
                          You are asked to input a number which will be displayed
                        </div>
                        <div className="col-xs-4">
                          Each value is a separate button, when one is clicked, it becomes active
                        </div>
                      </div>

                    </div>

                    <div id="add-activity-group-predefined" className={
                        "form-group" +
                        (value.value == "predefined" ? "" : " hidden") +
                        (predefined.error ?
                         " has-error has-feedback" : "")}>
                      <label className="control-label h4">Predefined values</label>
                      <ul>
                        {predefinedItems}
                      </ul>
                      <div className="input-group">
                        <input ref="predefinedInput" type="text"
                            className="form-control"
                            onKeyDown={this._handlePredefinedKeyDown} />
                        <span className="input-group-btn">
                        <button className="btn btn-default" type="button"
                            onClick={this._handlePredefinedClick}>Add</button>
                        </span>
                      </div>
                    </div>

                    <div className={"alert alert-danger"
                                    + (errorItems.length ? "" : " hidden")}>
                      {errorItems}
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary"
                            onClick={this._handleCreateClick}>Create Activity</button>
                    <button type="button" className="btn btn-default"
                            onClick={this._handleCancelClick}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
        )
    },

    reset: function() {
        this.replaceState(this.getInitialState());
    },

    _validateLabel: function(label) {
        return label ? true : LABEL_MISSING;
    },

    _validateType: function(type) {
        return type ? true : TYPE_MISSING;
    },

    _computeValue: function(update) {
        // TODO getValue("...")
        var type = update.type || this.getField("type").value;
        if (type == "event") {
            return update.eventValue || this.getField("eventValue").value;
        }
        else if (type == "timer") {
            return update.timerValue || this.getField("timerValue").value;
        }
        return null;
    },

    _validatePredefinedOptions: function(predefined, update) {
        var value = update.value || this.getField("value").value;
        if (value == "predefined" && predefined.length < 2) {
            return PREDEFINED_TOO_FEW;
        }
        return true;
    },

    _handleLabelChange: function(event) {
        this.setField("label", event.target.value);
        return false;
    },

    _handleTypeClick: function(event) {
        this.setField("type", event.target.value);
        return false;
    },

    _handleValueSelected: function(selectButton) {
        this.setField(selectButton.props.name, selectButton.props.value);
        return false;
    },

    _addPredefined: function() {
        var predefined = this.refs.predefinedInput.getDOMNode().value.trim();
        if (predefined) {
            var options = this.getField("predefined").value;
            this.setField("predefined", options.concat(predefined));
            this.refs.predefinedInput.getDOMNode().value = '';
        }
    },

    _handlePredefinedClick: function() {
        this._addPredefined();
        return false;
    },

    _handlePredefinedKeyDown: function(event) {
        if (event.key == "Enter") {
            this._addPredefined();
        }
        return true;
    },

    _handleCancelClick: function() {
        this.hide();
        this.reset();
        return false;
    },

    _handleCreateClick: function() {
        if (this.validateForm()) {
            var label = this.getField("label").value.trim();
            var type = this.getField("type").value;
            var value = this.getField("value").value;
            var predefined = value == "predefined" ?
                this.getField("predefined").value : null;
            console.debug(label, type, value, predefined);
            this.props.onValidated(label, type, value, predefined);

            this.hide();
            this.reset();
        }
        return false;
    }

});

module.exports = AddActivityModal;
