/** @jsx React.DOM */

var React = require('react');
var BootstrapModalMixin = require('./BootstrapModalMixin.react');

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

    mixins: [BootstrapModalMixin],

    propTypes: {
        onValidated: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            nameError: false,
            typeError: false,
            type: null
        }
    },

    render: function() {
        errors = [];
        if (this.state.nameError) {
            errors.push(<li key="name-missing">Enter a name</li>);
        }
        if (this.state.typeError) {
            errors.push(<li key="type-missing">Select a type</li>);
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

                    <div className=
                         {"form-group" + (this.state.nameError ?
                                          " has-error has-feedback" : "")} >
                      <label className="control-label"
                             htmlFor="add-activity-name">Name</label>
                      <input ref="name" type="text" className="form-control"
                             id="add-activity-name" placeholder="Name" />
                      <span className=
                            {"glyphicon glyphicon-remove form-control-feedback"
                             + (this.state.nameError ? "" : " hidden")}></span>
                    </div>

                    <div className=
                         {"form-group" + (this.state.typeError ?
                                          " has-error has-feedback" : "")}>
                      <label className="control-label">Type</label>
                      <div className="row">
                        <div className="col-xs-6">
                          <label className=
                               {"btn btn-primary btn-circle center-block" +
                                (this.state.type == 'event' ? " active" : "")}>
                            <span className="glyphicon glyphicon-ok-circle" />
                            <input ref="type_event" type="radio" name="type"
                                   value="event" className="hidden"
                                   onClick={this._handleTypeClick} />
                          </label>
                        </div>
                        <div className="col-xs-6">
                          <label className=
                               {"btn btn-primary btn-circle center-block" +
                                (this.state.type == 'duration' ?
                                 " active" : "")}>
                            <span className="glyphicon glyphicon-time" />
                            <input ref="type_duration" type="radio" name="type"
                                   value="duration" className="hidden"
                                   onClick={this._handleTypeClick} />
                          </label>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-6">
                          <h4>Event</h4>
                          <p>Records things at single points in time. Use it when you only want to know that something happened.</p>
                        </div>
                        <div className="col-xs-6">
                          <h4>Duration</h4>
                          <p>Works like and on/off switch. Use it when you want to know how much time something takes.</p>
                        </div>
                      </div>
                    </div>

                    <div className={"alert alert-danger"
                                    + (errors.length ? "" : " hidden")}>
                      {errors}
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-default"
                            onClick={this._handleCancelClick}>Cancel</button>
                    <button type="button" className="btn btn-primary"
                            onClick={this._handleAddClick}>Add</button>
                  </div>
                </div>
              </div>
            </div>
        )
    },

    reset: function() {
        this.replaceState({});
        this.refs.name.getDOMNode().value = '';
        this.refs.type_event.setState({checked: false});
        this.refs.type_duration.setState({checked: false});
    },

    _handleTypeClick: function(event) {
        this.setState({type: event.target.value});
        return false;
    },

    _handleCancelClick: function() {
        this.hide();
        this.reset();
        return false;
    },

    _handleAddClick: function() {
        name = this.refs.name.getDOMNode().value.trim();
        nameError = !name;

        type = this.state.type;
        typeError = !this.state.type;
        this.setState({typeError: typeError, nameError: !name});

        if (!nameError && !typeError) {
            this.props.onValidated(name, type);
            this.hide();
            this.reset();
        }
        return false;
    }

});

module.exports = AddActivityModal;
