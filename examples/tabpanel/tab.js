
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var events = require('component/events');
var Panel = require('./panel');

/**
 * Expose `Tab`.
 */

module.exports = Tab;

/**
 * Creates a new Tab.
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @api public
 */

function Tab(el, options) {
  this.el = el;
  this.panel = new Panel(options.panelGetter(el), options);
  this.selectFun = options.selectFun;

  this.events = events(el, this);
  this.events.bind('click');
  this.events.bind('keydown');

  this.el.setAttribute('aria-controls', this.panel.el.id);
  this.el.setAttribute('role', 'tab');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tab.prototype);

/**
 * Handle clicks on the Tab.
 *
 * @param {ClickEvent} e
 * @return {Tab}
 * @api private
 */

Tab.prototype.onclick = function (e) {
  this.emit('clicked', this);
  return this;
};

/**
 * Select this Tab.
 * Execute any custom function specified during config.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.select = function () {
  this.el.setAttribute('tabindex', '0');
  this.el.setAttribute('aria-selected', 'true');
  this.panel.show();

  // Execute any custom function specified during config.
  var selectFun = this.selectFun;
  if (selectFun && typeof selectFun == 'function') {
    this.selectFun();
  }

  return this;
};

/**
 * Deselect this Tab.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.deselect = function () {
  this.el.setAttribute('tabindex', '-1');
  this.el.setAttribute('aria-selected', 'false');
  this.panel.hide();
  return this;
};

/**
 * Handles keydown events on a given Tab.
 *
 * @param {KeydownEvent} e
 * @return {Tab}
 * @api private
 */

Tab.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  // Left/Up pressed
  if (~[37,38].indexOf(key)) {
    e.preventDefault();
    this.emit('navigated', 'prev');
  }
  // Right/Down pressed
  else if (~[39,40].indexOf(key)) {
    e.preventDefault();
    this.emit('navigated', 'next');
  }
};
