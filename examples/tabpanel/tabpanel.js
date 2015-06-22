
/**
 * Module dependencies.
 */

var Emitter = require('component/Emitter');
var events = require('component/events');
var query = require('component/query');
var Tablist = require('./tablist');

/**
 * Expose `Tabpanel`.
 */

module.exports = Tabpanel;

/**
 * Creates a new instance of `Tabpanel`.
 *
 * @param {HTMLElement} el
 * @param {Object} selectors
 * @api public
 */

function Tabpanel(el, selectors) {
  this.el = el;
  this.tablist = new Tablist(selectors, el);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tabpanel.prototype);
