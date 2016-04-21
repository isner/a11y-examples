
var query = require('component/query');
var Tabpanel = require('./tabpanel');

var selector = '#tabpanel-widget';

/**
 * Create a Tabpanel using the selector provided.
 */

var el = document.querySelector(selector);

var tp = new Tabpanel(el, {

  /**
   * A css selector that will find a single tablist
   * in the context of `el`.
   *
   * @type {String}
   */

  tablistSelector: 'ul.nav.nav-tabs',

  /**
   * A css selector that will find all tabs in the
   * context of  the tablist element.
   *
   * @type {String}
   */

  tabSelector: 'li > a',

  /**
   * A function which, when given a tab's element
   * reference, will find and return an element
   * reference for that tab's corresponding panel.
   *
   * @param {HTMLElement} tab
   * @return {HTMLElement}
   * @api private
   */

  panelGetter: function (tab) {
    var id = tab.getAttribute('data-panel');
    return query('#' + id);
  },

  /**
   * [optional]
   * A class that can be applied to panels in order
   * to hide them. If unsupplied, will default to
   * setting inline styles.
   *
   * @type {String}
   */

  hiddenClass: 'hidden',

  /**
   * [optional]
   * The index of the tab that should be selected
   * by default.
   *
   * @type {Number}
   */

  defaultIndex: 2,

  /**
   * [optional]
   * Called each time a tab is selected.
   *
   * @param {Tab} tab
   * @api private
   */

  selectFun: function (tab) {
    console.log('"%s" tab selected', tab.el.innerText);
  },

  /**
   * [optional]
   * Temporarily suppress any parent's "main" role when Tabbing
   * from the selected Tab to the Tabpanel.
   *
   * NOTE: This option is designed specifically to sidestep a VO/OSX bug.
   *
   * @type {Boolean}
   */

  suppressMain: true

});

console.log(tp);
