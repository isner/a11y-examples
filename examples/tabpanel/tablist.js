
/**
 * Module dependencies.
 */

var query = require('component/query');
var Tab = require('./tab');

/**
 * Expose `Tablist`.
 */

module.exports = Tablist;

/**
 * Create a new `Tablist`.
 *
 * @param {Object} options
 * @param {HTMLElement} el
 * @api private
 */

function Tablist(options, el) {
  var self = this;
  this.el = query(options.tablist, el);
  this.el.setAttribute('role', 'tablist');

  this.tabs = [];
  var tabs = query.all(options.tabs, this.el);
  [].slice.call(tabs).forEach(function (el) {
    var tab = new Tab(el, options);
    self.tabs.push(tab);
  });
}
