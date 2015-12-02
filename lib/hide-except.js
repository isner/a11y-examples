
/**
 * Module dependencies.
 */

var classes = require('component/classes');

/**
 * Expose `HideExcept`.
 */

module.exports = HideExcept;

/**
 * Create an instance of `HideExcept#`.
 *
 * @param {HTMLElement} el
 * @api public
 */

function HideExcept(el) {
  this.el = el;
  this.cache = [];
}

/**
 * Hide all elements except `#el`.
 *
 * @api public
 */

HideExcept.prototype.activate = function () {
  var self = this;
  var source = this.el;
  var parent = this.el.parentNode;

  while (parent && parent.nodeName != 'HTML') {
    var els = parent.childNodes;
    [].slice.call(els).forEach(function (el) {
      if (el == source || isParentOf(el, source)) {
        return;
      }
      self.hide(el);
    });
    parent = parent.parentNode;
  }
};

/**
 * Remove the hiding mechanism from all elements
 * in `#cache`.
 *
 * @api public
 */

HideExcept.prototype.deactivate = function () {
  this.cache.forEach(function (el) {
    // TODO add ability to detech presence of aria-hidden
    // attribute before this utility applies so we don't
    // clobber a pre-existing value
    el.removeAttribute('aria-hidden');
  });
  this.cache = [];
};

/**
 * Hide a given `el` and add it to `#cache`.
 *
 * @param {HTMLElement} el
 * @api private
 */

HideExcept.prototype.hide = function (el) {
  this.cache.push(el);
  el.setAttribute('aria-hidden', 'true');
};

/**
 * Checks to see whether `needle` is a parent of `origin`.
 *
 * @param {HTMLElement} origin
 * @param {HTMLElement} needle
 * @return {Boolean}
 * @api private
 */

function isParentOf(needle, origin) {
  var parent = origin.parentNode;
  var result = false;
  while (parent) {
    if (parent == needle) {
      result = true;
    }
    parent = parent.parentNode;
  }
  return result;
}
