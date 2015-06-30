
var query = require('component/query');
var Tabpanel = require('./tabpanel');

var selector = '#tabpanel-widget';

/**
 * Create a Tabpanel using the selector provided.
 */

var el = document.querySelector(selector);

var tp = new Tabpanel(el, {
  // A css selector that will find a single tablist
  // in the context of `el`.
  tablistSelector: 'ul.nav.nav-tabs',
  // A css selector that will find all tabs in the
  // context of  the tablist element.
  tabSelector: 'li > a',
  // A function which, when given a tab's element
  // reference, will find and return an element
  // reference for that tab's corresponding panel.
  panelGetter: function (tab) {
    var id = tab.getAttribute('data-panel');
    return query('#' + id);
  },
  // [optional] A class that can be applied to
  // panels in order to hide them. If unsupplied,
  // will default to setting inline styles.
  hiddenClass: 'hidden',
  // [optional] The index of the tab that should
  // be selected by default.
  defaultIndex: 2,
  selectFun: function () {
    console.log('my custom function was called');
  }
});

console.log(tp);
