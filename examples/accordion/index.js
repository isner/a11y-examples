
/**
 * Module dependencies.
 */

var displaySource = require('../../lib/display-source');
var Accordion = require('./accordion');
var query = require('component/query');

/**
 * Create an Accordion using the selector provided.
 */

var el = query('#myAccordion');

new Accordion(el, {
  pair: '.panel',
  tab: '.panel-heading',
  panel: '.panel-body',
  suppressMain: true
});

/**
 * Display the source files.
 */

displaySource(require('./source'));
