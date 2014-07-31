/** @jsx React.DOM */

var React = require('react');

/* TODO:
 *   - reactify bootstrap data-toggle="collapse"
 *   - get button to the right when collapsed (almost hopeless)
 *   - get button shown when collapsed (hopeless)
 *   - Sign in button
 *   - after navbar-brand: <p class="navbar-text">... text?</p>
 */
var Navbar = React.createClass({

    propTypes: {
        onAddActivityClick: React.PropTypes.func.isRequired,
    },

    render: function() {
        return (
            <nav className="navbar navbar-inverse navbar-static-top"
                 role="navigation">
              <div className="container-fluid">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle"
                          data-toggle="collapse"
                          data-target="#bs-example-navbar-collapse-3">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <a className="navbar-brand" href="#">misfire</a>
                </div>
                <div className="collapse navbar-collapse"
                     id="bs-example-navbar-collapse-3">
                  <button type="button" className="btn btn-default navbar-btn"
                          onClick={this._handleAddActivityClick}>
                    <span className="glyphicon glyphicon-plus"></span>
                  </button>
                </div>
              </div>
            </nav>
        )
    },

    _handleAddActivityClick: function() {
        this.props.onAddActivityClick();
        return false;
    }

});

module.exports = Navbar;
