
/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var Emitter = require('component/emitter');
var query = require('component/query');

/**
 * Expose `Tab`.
 */

module.exports = Tab;

/**
 * Creates a new `Tab`.
 *
 * @param {String} selector
 * @param {HTMLElement} el - Pair#el
 * @api public
 */

function Tab(selector, el) {
  this.el = query(selector, el);
  this.el.setAttribute('role', 'tab');
  this.el.setAttribute('aria-selected', 'false');
  this.el.setAttribute('aria-expanded', 'false');
  this.el.id = this.el.id || rndid();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tab.prototype);

/**
 * Update the Tab's attributes to reflect the fact
 * that its corresponding Panel is expanded.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.expand = function () {
  this.el.setAttribute('aria-expanded', 'true');
  return this;
};


/**
 * Update the Tab's attributes to reflect the fact
 * that its corresponding Panel is collapsed.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.collapse = function () {
  this.el.setAttribute('aria-expanded', 'false');
  return this;
};
