
/**
 * Module dependencies.
 */

var Emitter = require('component/Emitter');
var Tablist = require('./tablist');

/**
 * Expose `Tabpanel`.
 */

module.exports = Tabpanel;

/**
 * Creates a new instance of `Tabpanel`.
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @api public
 */

function Tabpanel(el, options) {
  this.el = el;
  this.tablist = new Tablist(options, el);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tabpanel.prototype);
