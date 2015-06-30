
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
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
 * @api public
 */

function Tablist(options, el) {
  var self = this;
  this.el = query(options.tablistSelector, el);
  this.defaultIndex = options.defaultIndex;
  this.el.setAttribute('role', 'tablist');

  // Create Tabs for this Tablist.

  this.tabs = [];
  var tabs = query.all(options.tabSelector, this.el);
  [].slice.call(tabs).forEach(function (el) {
    var tab = new Tab(el, options);
    self.tabs.push(tab);

    var parent = tab.el.parentNode;
    while (parent != this.el) {
      tab.el.parentNode.setAttribute('role', 'presentation');
      parent = parent.parentNode;
    }
  });

  this.init();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tablist.prototype);

/**
 * Define the default selected Tab,
 * and bind listener to affect Tablist when a Tab
 * is selected.
 *
 * @return {Tablist}
 * @api public
 */

Tablist.prototype.init = function () {
  var self = this;
  this.selectedIndex = this.defaultIndex;

  this.tabs.forEach(function (tab, i) {
    if (i == self.selectedIndex) {
      tab.select();
    }
    else {
      tab.deselect();
    }

    tab
    .on('clicked', function (selectedTab) {
      self.tabs.forEach(function (tab, i) {
        if (tab == selectedTab) {
          self.selectedIndex = i;
          tab.select();
          self.deselectAllExcept(tab);
          tab.el.focus();
        }
      });
    })
    .on('navigated', function (dir) {
      switch (dir) {
        case 'prev':
          self.selectedIndex = self.selectedIndex === 0
            ? self.tabs.length - 1
            : self.selectedIndex - 1;
          break;
        case 'next':
          self.selectedIndex = self.selectedIndex === self.tabs.length - 1
            ? 0
            : self.selectedIndex + 1;
          break;
      }
      var tab = self.tabs[self.selectedIndex];
      tab.select();
      self.deselectAllExcept(tab);
      tab.el.focus();
    });

  });

  return this;
};

/**
 * Deselect all Tabs in the Tablist except a given Tab.
 *
 * @param {Tab} exceptTab
 * @return {Tablist}
 * @api private
 */

Tablist.prototype.deselectAllExcept = function (exceptTab) {
  this.tabs.forEach(function (tab) {
    if (tab != exceptTab) {
      tab.deselect();
    }
  });
  return this;
};
