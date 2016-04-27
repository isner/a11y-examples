
/**
 * Module dependencies.
 */

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

require('../../lib/display-source')(require('./source'));
