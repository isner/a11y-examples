
/**
 * Module dependencies.
 */

var Emitter = require('component/Emitter');
var events = require('component/events');
var query = require('component/query');
var Pair = require('./pair');

/**
 * Expose `Accordion`.
 */

module.exports = Accordion;

/**
 * Creates a new instance of `Accordion`.
 *
 * @param {HTMLElement} el - outermost container
 * @param {Object} selectors
 * @api public
 */

function Accordion(el, selectors) {
  if (!(this instanceof Accordion)) {
    return new Accordion(selectors);
  }
  this.el = el;
  this.pairs = [];
  this.selectedIndex = 0;

  var self = this;
  var pairs = query.all(selectors.pair);

  [].slice.call(pairs).forEach(function (el, i) {
    var pair = self.pairs[i] = new Pair(el, selectors, i)
      .collapse()
      .on('select', function (data) {
        self.updateIndex(data.val);
      });
    var tabindex = i === 0 ? '0' : '-1';
    pair.tab.el.setAttribute('tabindex', tabindex);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Accordion.prototype);

/**
 * Update the Accordion's #selectedIndex, determined
 * by `val`, deselect all Tabs, and select the
 * new active Tab.
 *
 * @param {[String|Number]} val
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.updateIndex = function (val) {
  var current = this.selectedIndex;

  // If relative movement instruction is provided, use it
  // else use the specific index
  switch (val) {
    case 'prev':
      this.selectedIndex = current > 0
        ? current - 1
        : this.pairs.length - 1;
      break;
    case 'next':
      this.selectedIndex = current < this.pairs.length - 1
        ? current + 1
        : 0;
      break;
    case 'first':
      this.selectedIndex = 0;
      break;
    case 'last':
      this.selectedIndex = this.pairs.length - 1;
      break;
    default:
      this.selectedIndex = val;
  }

  this.selectPair(this.selectedIndex);

  return this;
};

/**
 * Deselect all Pairs in this Accordion.
 *
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.deselectAllPairs = function () {
  this.pairs.forEach(function (pair) {
    pair.deselect();
  });

  return this;
};

/**
 * Select a Pair of a given index.
 *
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.selectPair = function (i) {
  this.deselectAllPairs();
  this.pairs[i].select();

  return this;
};
