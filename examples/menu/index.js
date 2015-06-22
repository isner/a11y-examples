
var Megamenu = require('./megamenu');

var selector = '#myMegamenu';

/**
 * Create new Megamenu using the selector provided.
 */

var menu = document.querySelector(selector);

if (!menu) {
  console.error('query failed: %s', selector);
}

menu = new Megamenu(menu);
console.log(menu);