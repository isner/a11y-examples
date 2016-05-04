(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
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

}, {"../../lib/display-source":2,"component/query":3,"./expanded":4,"./source":5}],
2: [function(require, module, exports) {

var query = require('component/query');

module.exports = displaySource;

function displaySource(sourceArr) {
  if (sourceArr.length == 1 && sourceArr[0].name == 'source.js') {
    return;
  }
  var cage = query('#source');
  var sectionHeading = document.createElement('h2');
  sectionHeading.innerHTML = 'Source Files';
  sectionHeading.className = 'page-header';
  cage.appendChild(sectionHeading);

  sourceArr.forEach(function (file) {
    var isSourceJs = file.name == 'source.js';
    var isHtml = ~file.name.search('.html');
    var isJade = ~file.name.search('.jade');
    var isStyl = ~file.name.search('.styl');
    var isText = ~file.name.search('.txt');

    if (isSourceJs || isHtml || isJade || isStyl || isText) {
      return;
    }
    var heading = document.createElement('h3');
    var code = document.createElement('pre');

    heading.innerHTML = file.name;
    code.innerHTML = file.code;

    cage.appendChild(heading);
    cage.appendChild(code);
  });
}

}, {"component/query":3}],
3: [function(require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
4: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var classes = require('component/classes');
var events = require('component/events');

/**
 * Define constants.
 */

var EXPANDED = 'aria-expanded';
var CONTROLS = 'aria-controls';
var HIDDEN = 'aria-hidden';

/**
 * Expose `expanded`.
 */

module.exports = Expanded;

/**
 * Create an expandable trigger/area widget.
 *
 * @param {HTMLElement} trigger - SHOULD be button or anchor
 * @param {HTMLElement} area
 * @param {Object} [opts] - see CONFIGURATION below
 * @api public
 *
 * CONFIGURATION
 *
 * --- `opts.initalState` ---
 * The inital expanded state of the widget.
 * Defaults to `false`.
 *
 * --- `opts.hiddenClass` ---
 * If the page already uses a class to hide elements
 * in an accessible manner, you can specify the
 * classname to be used by `Expanded#`.
 * Default behavior uses inline `display: block;`
 * to hide the `area`.
 *
 * --- `opts.handler` ---
 * If the page already contains a handler that toggles
 * the visiblity of the expandable area, specify the
 * function here and remove it from its original
 * context in the page.
 * Useful if the area expansion is animated and you
 * wish to retain the animation, but still want
 * accessibilty amrkup added.
 *
 * NOTE
 *
 * `trigger` SHOULD be a button or anchor because
 * these element types fire a "click" event on Enter
 * (and/or Space) presses. Otherwise, only mouse clicks
 * will activate the trigger.
 */

function Expanded(trigger, area, opts) {
  if (validateArgs(trigger, area)) {
    return;
  }
  opts = opts || {};

  this.trigger = trigger;
  this.area = area;
  this.state = opts.initialState || false;
  this.hiddenClass = opts.hiddenClass;
  this.handler = opts.handler;

  this.events = events(trigger, this);
  this.events.bind('click');

  // Set initial state of trigger's expanded attribute
  trigger.setAttribute(EXPANDED, this.state);

  // Set inital state of area
  if (this.state) {
    this.showArea();
  }
  else {
    this.hideArea();
  }

  // If necessary, establish 'owned by' relationship
  if (!area.contains(trigger)) {
    area.id = area.id || assignId(area);
    trigger.setAttribute(CONTROLS, area.id);
  }
}

/**
 * Handles "click" events on `#trigger`.
 *
 * @api private
 */

Expanded.prototype.onclick = function () {
  // Toggle the widget's state
  this.state = !this.state;

  // Update the trigger's expanded attribute
  this.trigger.setAttribute(EXPANDED, this.state);

  // Toggle the area's visibility
  if (this.state) {
    this.showArea();
  }
  else {
    this.hideArea();
  }

  if (this.handler) {
    this.handler();
  }
};

/**
 * Updates "aria-expanded" on `#trigger`.
 * Hides the expandable `#area`.
 *
 * @return {Expanded}
 * @api private
 */

Expanded.prototype.hideArea = function () {
  var area = this.area;
  var handler = this.handler;
  var hiddenClass = this.hiddenClass;

  area.setAttribute(HIDDEN, 'true');

  if (!handler) {
    if (hiddenClass) {
      classes(area).add(hiddenClass);
    }
    else {
      area.style.display = 'none';
    }
  }
  return this;
};

/**
 * Updates "aria-expanded" on `#trigger`.
 * Shows the expandable `#area`.
 *
 * @return {Expanded}
 * @api private
 */

Expanded.prototype.showArea = function () {
  var area = this.area;
  var handler = this.handler;
  var hiddenClass = this.hiddenClass;

  area.setAttribute(HIDDEN, 'false');

  if (!handler) {
    if (hiddenClass) {
      classes(area).remove(hiddenClass);
    }
    else {
      area.style.display = 'block';
    }
  }
  return this;
};

/**
 * Validates the arguments provided to `Expanded`.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement} area
 * @return {Mixed} - `Error#` or `false`
 * @api private
 */

function validateArgs(trigger, area) {
  if (!trigger) {
    return new Error('trigger is required');
  }
  if (!area) {
    return new Error('area is required');
  }
  if (!trigger.nodeType || trigger.nodeType != 1) {
    return new Error('trigger must be an element');
  }
  if (!area.nodeType || area.nodeType != 1) {
    return new Error('area must be an element');
  }
  return false;
}

/**
 * Assigns a random, unique id to a given `el`.
 *
 * @param {HTMLElement} el
 * @return {String}
 * @api public
 */

function assignId(el) {
  el.id = rndid();
  return el.id;
}

}, {"stephenmathieson/rndid":6,"component/classes":7,"component/events":8}],
6: [function(require, module, exports) {

/**
 * Expose `rndid`.
 */

exports = module.exports = rndid;

/**
 * Default ID length.
 */

exports.defaultLength = 7;

/**
 * Return a guaranteed unique id of the provided
 * `length`, optionally prefixed with `prefix`.
 *
 * If no length is provided, will use
 * `rndid.defaultLength`.
 *
 * @api private
 * @param {String} [prefix]
 * @param {Number} [length]
 * @return {String}
 */

function rndid(prefix, length) {
  if ('number' == typeof prefix)
    length = prefix, prefix = '';
  length = length || exports.defaultLength;
  var id = (prefix || '') + str(length);
  if (document.getElementById(id)) return rndid(prefix, length);
  return id;
}

/**
 * Generate a random alpha-char.
 *
 * @api private
 * @return {String}
 */

function character() {
  return String.fromCharCode(Math.floor(Math.random() * 25) + 97);
}

/**
 * Generate a random alpha-string of `len` characters.
 *
 * @api private
 * @param {Number} len
 * @return {String}
 */

function str(len) {
  for (var i = 0, s = ''; i < len; i++) s += character();
  return s;
}

}, {}],
7: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var index = require('indexof');
} catch (err) {
  var index = require('component-indexof');
}

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

}, {"indexof":9,"component-indexof":9}],
9: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
8: [function(require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var events = require('event');
} catch(err) {
  var events = require('component-event');
}

try {
  var delegate = require('delegate');
} catch(err) {
  var delegate = require('component-delegate');
}

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

}, {"event":10,"component-event":10,"delegate":11,"component-delegate":11}],
10: [function(require, module, exports) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
11: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var closest = require('closest');
} catch(err) {
  var closest = require('component-closest');
}

try {
  var event = require('event');
} catch(err) {
  var event = require('component-event');
}

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

}, {"closest":12,"component-closest":12,"event":10,"component-event":10}],
12: [function(require, module, exports) {
/**
 * Module Dependencies
 */

try {
  var matches = require('matches-selector')
} catch (err) {
  var matches = require('component-matches-selector')
}

/**
 * Export `closest`
 */

module.exports = closest

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Element} scope (optional)
 */

function closest (el, selector, scope) {
  scope = scope || document.documentElement;

  // walk up the dom
  while (el && el !== scope) {
    if (matches(el, selector)) return el;
    el = el.parentNode;
  }

  // check scope for match
  return matches(el, selector) ? el : null;
}

}, {"matches-selector":13,"component-matches-selector":13}],
13: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var query = require('query');
} catch (err) {
  var query = require('component-query');
}

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

}, {"query":3,"component-query":3}],
5: [function(require, module, exports) {
module.exports = [{"name":"expanded.js","code":"\n/**\n * Module dependencies.\n */\n\nvar rndid = require('stephenmathieson/rndid');\nvar classes = require('component/classes');\nvar events = require('component/events');\n\n/**\n * Define constants.\n */\n\nvar EXPANDED = 'aria-expanded';\nvar CONTROLS = 'aria-controls';\nvar HIDDEN = 'aria-hidden';\n\n/**\n * Expose `expanded`.\n */\n\nmodule.exports = Expanded;\n\n/**\n * Create an expandable trigger/area widget.\n *\n * @param {HTMLElement} trigger - SHOULD be button or anchor\n * @param {HTMLElement} area\n * @param {Object} [opts] - see CONFIGURATION below\n * @api public\n *\n * CONFIGURATION\n *\n * --- `opts.initalState` ---\n * The inital expanded state of the widget.\n * Defaults to `false`.\n *\n * --- `opts.hiddenClass` ---\n * If the page already uses a class to hide elements\n * in an accessible manner, you can specify the\n * classname to be used by `Expanded#`.\n * Default behavior uses inline `display: block;`\n * to hide the `area`.\n *\n * --- `opts.handler` ---\n * If the page already contains a handler that toggles\n * the visiblity of the expandable area, specify the\n * function here and remove it from its original\n * context in the page.\n * Useful if the area expansion is animated and you\n * wish to retain the animation, but still want\n * accessibilty amrkup added.\n *\n * NOTE\n *\n * `trigger` SHOULD be a button or anchor because\n * these element types fire a \"click\" event on Enter\n * (and/or Space) presses. Otherwise, only mouse clicks\n * will activate the trigger.\n */\n\nfunction Expanded(trigger, area, opts) {\n  if (validateArgs(trigger, area)) {\n    return;\n  }\n  opts = opts || {};\n\n  this.trigger = trigger;\n  this.area = area;\n  this.state = opts.initialState || false;\n  this.hiddenClass = opts.hiddenClass;\n  this.handler = opts.handler;\n\n  this.events = events(trigger, this);\n  this.events.bind('click');\n\n  // Set initial state of trigger's expanded attribute\n  trigger.setAttribute(EXPANDED, this.state);\n\n  // Set inital state of area\n  if (this.state) {\n    this.showArea();\n  }\n  else {\n    this.hideArea();\n  }\n\n  // If necessary, establish 'owned by' relationship\n  if (!area.contains(trigger)) {\n    area.id = area.id || assignId(area);\n    trigger.setAttribute(CONTROLS, area.id);\n  }\n}\n\n/**\n * Handles \"click\" events on `#trigger`.\n *\n * @api private\n */\n\nExpanded.prototype.onclick = function () {\n  // Toggle the widget's state\n  this.state = !this.state;\n\n  // Update the trigger's expanded attribute\n  this.trigger.setAttribute(EXPANDED, this.state);\n\n  // Toggle the area's visibility\n  if (this.state) {\n    this.showArea();\n  }\n  else {\n    this.hideArea();\n  }\n\n  if (this.handler) {\n    this.handler();\n  }\n};\n\n/**\n * Updates \"aria-expanded\" on `#trigger`.\n * Hides the expandable `#area`.\n *\n * @return {Expanded}\n * @api private\n */\n\nExpanded.prototype.hideArea = function () {\n  var area = this.area;\n  var handler = this.handler;\n  var hiddenClass = this.hiddenClass;\n\n  area.setAttribute(HIDDEN, 'true');\n\n  if (!handler) {\n    if (hiddenClass) {\n      classes(area).add(hiddenClass);\n    }\n    else {\n      area.style.display = 'none';\n    }\n  }\n  return this;\n};\n\n/**\n * Updates \"aria-expanded\" on `#trigger`.\n * Shows the expandable `#area`.\n *\n * @return {Expanded}\n * @api private\n */\n\nExpanded.prototype.showArea = function () {\n  var area = this.area;\n  var handler = this.handler;\n  var hiddenClass = this.hiddenClass;\n\n  area.setAttribute(HIDDEN, 'false');\n\n  if (!handler) {\n    if (hiddenClass) {\n      classes(area).remove(hiddenClass);\n    }\n    else {\n      area.style.display = 'block';\n    }\n  }\n  return this;\n};\n\n/**\n * Validates the arguments provided to `Expanded`.\n *\n * @param {HTMLElement} trigger\n * @param {HTMLElement} area\n * @return {Mixed} - `Error#` or `false`\n * @api private\n */\n\nfunction validateArgs(trigger, area) {\n  if (!trigger) {\n    return new Error('trigger is required');\n  }\n  if (!area) {\n    return new Error('area is required');\n  }\n  if (!trigger.nodeType || trigger.nodeType != 1) {\n    return new Error('trigger must be an element');\n  }\n  if (!area.nodeType || area.nodeType != 1) {\n    return new Error('area must be an element');\n  }\n  return false;\n}\n\n/**\n * Assigns a random, unique id to a given `el`.\n *\n * @param {HTMLElement} el\n * @return {String}\n * @api public\n */\n\nfunction assignId(el) {\n  el.id = rndid();\n  return el.id;\n}\n"},{"name":"index.jade","code":"\nextends ../layout\n\nblock vars\n  - var heading = 'Button'\n\nblock content\n  #jerry.panel.panel-default\n    .panel-heading\n      h2 Basic Expandable Area\n\n    .panel-body\n      p Jerome \"Jerry\" Seinfeld is the protagonist of the American television sitcom Seinfeld (1989&dash;1998).\n\n      .form-group\n        .input-group\n          button.form-control.expand-trigger View More\n\n      .well.expand-area\n        p The straight man among his group of friends, this semi-fictionalized version of comedian Jerry Seinfeld was named after, co-created by, based on, and played by Seinfeld himself. The series revolves around Jerry's misadventures with his best friend George Costanza, neighbor Cosmo Kramer, and ex-girlfriend Elaine Benes. He is usually the voice of reason amidst his friends' antics and the focal point of the foursome's relationship.\n\n  #elaine.panel.panel-default\n\n    .panel-heading\n      h2 Animated Expandable Area\n\n    .panel-body\n      p Elaine Marie Benes is a fictional character on the American television sitcom Seinfeld (1989&dash;1998), played by Julia Louis-Dreyfus.\n\n      .form-group\n        .input-group\n          button.form-control.expand-trigger View More\n\n      .well.expand-area(style=\"display: none;\")\n        p Elaine's best friend is her ex-boyfriend Jerry Seinfeld, and she is also good friends with George Costanza and Cosmo Kramer. Julia Louis-Dreyfus received critical acclaim for her performance as Elaine, winning an Emmy, a Golden Globe and five SAG Awards.\n\nblock scripts\n  script(src=\"index.js\")\n\nblock styles\n  link(rel=\"stylesheet\" href=\"index.css\")\n"},{"name":"index.js","code":"/* global $ */\n\nvar displaySource = require('../../lib/display-source');\nvar query = require('component/query');\nvar Expanded = require('./expanded');\n\n/**\n * Expandable area example #1 (Jerry)\n */\n\nvar trigger = query('#jerry .expand-trigger');\nvar area = query('#jerry .expand-area');\n\nnew Expanded(trigger, area, {\n  initialState: false,\n  hiddenClass: 'hidden'\n});\n\n/**\n * Expandable area example #2 (Elaine)\n */\n\nvar trigger = query('#elaine .expand-trigger');\nvar area = query('#elaine .expand-area');\n\nfunction animate() {\n  $(area).toggle('blind', { direction: 'up' }, 200);\n}\n\nnew Expanded(trigger, area, {\n  initialState: false,\n  handler: function () {\n    animate();\n  }\n});\n\n/**\n * Display the source files.\n */\n\ndisplaySource(require('./source'));\n"},{"name":"index.styl","code":"\n@require '../global'\n\n.hidden\n  display none\n"}];
}, {}]}, {}, {"1":""})