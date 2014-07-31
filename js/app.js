/** @jsx React.DOM */

var React = require('react');

var MisfireApp = require('./components/MisfireApp.react');

React.renderComponent(
    <MisfireApp />,
    document.getElementById('main')
);
