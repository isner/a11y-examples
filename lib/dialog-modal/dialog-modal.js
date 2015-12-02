
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var events = require('component/events');

var HideExcept = require('../hide-except');
var Overlay = require('./overlay');
var Modal = require('./modal');

/**
 * Expose `DialogModal`.
 */

module.exports = DialogModal;

/**
 * Creates a new instance of `DialogModal`.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement|String} content
 * @param {String} headingText
 */

function DialogModal(trigger, content, headingText, isAlert) {
  if (trigger.nodeType != 1) {
    throw new TypeError('`trigger` must be an element');
  }
  var self = this;
  this.trigger = trigger;

  this.modal = new Modal(content, headingText, isAlert)
  .on('close-dialog', function () {
    self.close();
  });

  this.overlay = new Overlay()
  .on('close-dialog', function () {
    self.close();
  });

  this.hider = new HideExcept(this.modal.el);

  this.events = events(trigger, this);
  this.events.bind('click');
}

/**
 * Mixin `Emitter`.
 */

Emitter(DialogModal.prototype);

/**
 * Handles click events on the DialogModal's trigger.
 *
 * @return {DialogModal}
 * @api private
 */

DialogModal.prototype.onclick = function () {
  this.open();
  return this;
};

DialogModal.prototype.open = function () {
  this.overlay.show();
  this.modal.show();
  this.hider.activate();
};

DialogModal.prototype.close = function () {
  this.overlay.hide();
  this.modal.hide();
  this.hider.deactivate();
  this.trigger.focus();
};
