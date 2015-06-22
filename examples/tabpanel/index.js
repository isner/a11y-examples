
var query = require('component/query');
var Tabpanel = require('./tabpanel');

var selector = '#tabpanel-widget';

/**
 * Create a Tabpanel using the selector provided.
 *
 * PRE-REQS:
 * 1) each panel MUST have an id
 * 2) each tab MUST have a "data-panel" attribute
 *    with the id of its corresponding panel
 * 3) a css declaration SHOULD be available that
 *    applies display="hidden"
 */

var el = document.querySelector(selector);

var tp = new Tabpanel(el, {
  tablist: 'ul.nav.nav-tabs',
  tabs: 'li > a',
  // Used to get the panel for a given tab
  panelGetter: function (tab) {
    var id = tab.getAttribute('data-panel');
    return query('#' + id);
  },
  hiddenClass: 'hidden'
});

console.log(tp);
