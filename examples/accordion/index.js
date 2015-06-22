
var Accordion = require('./accordion');

var selector = '#myAccordion';

/**
 * Create an Accordion using the selector provided.
 */

var el = document.querySelector(selector);

new Accordion(el, {
  pair: '.panel',
  tab: '.panel-heading',
  panel: '.panel-body'
});
