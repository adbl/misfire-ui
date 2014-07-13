/** @jsx React.DOM */

var React = require('react');

var BootstrapModalMixin = function() {
    var handlerProps =
        ['onShow', 'onShown', 'onHide', 'onHidden'];
    var bsModalEvents = {
        onShow: 'show.bs.modal',
        onShown: 'shown.bs.modal',
        onHide: 'hide.bs.modal',
        onHidden: 'hidden.bs.modal'
    }
    return {

        propTypes: {
            onShow: React.PropTypes.func,
            onShown: React.PropTypes.func,
            onHide: React.PropTypes.func,
            onHidden: React.PropTypes.func,
            backdrop: React.PropTypes.bool,
            keyboard: React.PropTypes.bool,
            show: React.PropTypes.bool,
            remote: React.PropTypes.string
        },

        getDefaultProps: function() {
            return {
                backdrop: true,
                keyboard: true,
                show: true,
                remote: ''
            }
        },

        componentDidMount: function() {
            var $modal = $(this.getDOMNode()).modal({
                backdrop: this.props.backdrop,
                keyword: this.props.keyboard,
                show: this.props.show,
                remote: this.props.remote
            })
            handlerProps.forEach(function(prop) {
                if (this[prop]) {
                    $modal.on(bsModalEvents[prop], this[prop])
                }
                if (this.props[prop]) {
                    $modal.on(bsModalEvents[prop], this.props[prop])
                }
            }.bind(this))
        },

        componenWillUnmount: function() {
            var $modal = $(this.getDOMNode())
            handlerProps.forEach(function(prop) {
                if (this[prop]) {
                    $modal.off(bsModalEvents[prop], this[prop])
                }
                if (this.props[prop]) {
                    $modal.off(bsModalEvents[prop], this.props[prop])
                }
            }.bind(this))
        },

        hide: function() {
            $(this.getDOMNode()).modal('hide')
        },

        show: function() {
            $(this.getDOMNode()).modal('show')
        },

        toggle: function() {
            $(this.getDOMNode()).modal('toggle')
        },

        renderCloseButton: function() {
            return <button type="button" className="close" onClick={this.hide}
                       dangerouslySetInnerHTML={{__html: '&times'}} />
        }

    }
}()

module.exports = BootstrapModalMixin;
