
/**
 * Module dependencies.
 */

var query = require('component/query');
var Panel = require('./panel');

/**
 * Expose `Tab`.
 */

module.exports = Tab;

function Tab(el, options) {
  this.el = el;
  this.panel = new Panel(options.panelGetter(el), options);
}
