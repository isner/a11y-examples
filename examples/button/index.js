/* global $ */

var displaySource = require('../../lib/display-source');
var query = require('component/query');
var Expanded = require('./expanded');

/**
 * Expandable area example #1 (Jerry)
 */

var trigger = query('#jerry .expand-trigger');
var area = query('#jerry .expand-area');

new Expanded(trigger, area, {
  initialState: false,
  hiddenClass: 'hidden'
});

/**
 * Expandable area example #2 (Elaine)
 */

var trigger = query('#elaine .expand-trigger');
var area = query('#elaine .expand-area');

function animate() {
  $(area).toggle('blind', { direction: 'up' }, 200);
}

new Expanded(trigger, area, {
  initialState: false,
  handler: function () {
    animate();
  }
});

/**
 * Display the source files.
 */

displaySource(require('./source'));
