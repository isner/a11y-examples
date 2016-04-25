
/**
 * Module dependencies.
 */

var query = require('component/query');

/**
 * Expose `suppressMain`.
 */

module.exports = suppressMain;

/**
 * Suppresses "main" landmark semantics,
 * and reapplies them after a specified `time`.
 * Executes a given `fun` in the interim.
 *
 * @param  {Function} fun
 * @param  {Number} time - milliseconds
 */

function suppressMain(fun, time) {
  var mains = query.all('main, [role="main"]');
  if (!mains.length) {
    return fun();
  }
  [].slice.call(mains).forEach(function (main) {
    var role = main.getAttribute('role');
    main.setAttribute('role', 'presentation');
    fun();
    window.setTimeout(function () {
      if (role) {
        main.setAttribute('role', role);
      }
      else {
        main.removeAttribute('role');
      }
    }, time);
  });
}
