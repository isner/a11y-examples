
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');

/**
 * Expose `Panel`.
 */

module.exports = Panel;

/**
 * Creates a new `Panel`.
 *
 * @param {String} selector
 * @param {HTMLElement} el - Pair#el
 * @api public
 */

function Panel(selector, el) {
  this.el = query(selector, el);
  this.el.setAttribute('role', 'tabpanel');
  this.el.setAttribute('aria-hidden', 'true');

  this.events = events(el, this);
  this.events.bind('keydown');
  this.events.bind('blur');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Panel.prototype);

/**
 * Show this Panel.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.show = function () {
  classes(this.el).remove('hidden');
  this.el.setAttribute('aria-hidden', 'false');
  return this;
};


/**
 * Hide this Panel.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.hide = function () {
  classes(this.el).add('hidden');
  this.el.setAttribute('aria-hidden', 'true');
  return this;
};

/**
 * Handles keydown events on the Panel.
 *
 * @param {KeyEvent} e
 * @return {Panel}
 * @api private
 */

Panel.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  // Ctrl + HOME
  if (key == 36 && e.ctrlKey) {
    e.preventDefault();
    this.emit('focus-tab');
  }
  return this;
};

Panel.prototype.focusTemp = function () {
  this.el.setAttribute('tabindex', '-1');
  this.el.focus();
};

Panel.prototype.onblur = function (e) {
  this.el.removeAttribute('tabindex');
};
