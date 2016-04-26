
/**
 * Expose module.
 */

module.exports = {
  add: add,
  remove: remove
};

/**
 * Adds a given `val` to a given `attr` on a given `el`.
 * For use with attributes that support space-delimited token lists.
 *
 * @param {HTMLElement} el
 * @param {String} attr
 * @param {String} val
 */

function add(el, attr, val) {
  var curVal = el.getAttribute(attr) || '';
  var valArr = curVal.split(' ');
  if (valArr.indexOf(val) >= 0) {
    // value already exists, so noop
    return;
  }
  valArr.push(val);
  el.setAttribute(attr, valArr.join(' ').trim());
}

/**
 * Removes a given `val` from a given `attr` on a given `el`.
 * For use with attributes that support space-delimited token lists.
 *
 * @param {HTMLElement} el
 * @param {String} attr
 * @param {String} val
 */

function remove(el, attr, val) {
  var curVal = el.getAttribute(attr);
  if (!curVal) {
    // attribute has no value, so noop
    return;
  }
  var valArr = curVal.split(' ');
  var idx = valArr.indexOf(val);
  if (idx < 0) {
    // value doesn't exist, so noop
    return;
  }
  valArr.splice(idx, 1);
  if (!valArr.length) {
    // removing the last token, so remove the whole attribute
    el.removeAttribute(attr);
  }
  else {
    el.setAttribute(attr, valArr.join(' ').trim());
  }
}
