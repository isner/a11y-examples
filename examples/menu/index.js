
/**
 * Module dependencies.
 */

var Megamenu = require('./megamenu');

/**
 * Create new Megamenu using the selector provided.
 */

var menu = document.querySelector('#myMegamenu');

menu = new Megamenu(menu);

/**
 * Display the source files.
 */

require('../../lib/display-source')(require('./source'));
