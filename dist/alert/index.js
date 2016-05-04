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

/**
 * Module dependencies.
 */

var displaySource = require('../../lib/display-source');
var query = require('component/query');
var Alert = require('./alert');

var selectors = {
  form: 'form',
  input: 'input[type=text]',
  submit: 'button',
  alert: '.alert'
};

var form = query(selectors.form);
var input = query(selectors.input, form);
var submit = query(selectors.submit, form);
var alert = new Alert(query(selectors.alert));

form.addEventListener('submit', function (e) {
  e.preventDefault();
  alert.hide();

  if (!input.value.length) {
    alert
      .text('At least make an effort!')
      .type('danger');
  }
  else if (input.value != '42') {
    alert
      .text('Sorry. "<span class="bold">' + input.value + '</span>" is not the Answer to The Ultimate Question of Life, the Universe, and Everything')
      .type('danger');
  }
  else {
    alert
      .text('Congratulations! "<span class="bold">42</span>" is the Answer to The Ultimate Question of Life, the Universe, and Everything')
      .type('success');
  }

  input.select();
  alert.show();
});

/**
 * Display the source files.
 */

displaySource(require('./source'));

}, {"../../lib/display-source":2,"component/query":3,"./alert":4,"./source":5}],
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

var classes = require('component/classes');

/**
 * Expose `Alert`.
 */

module.exports = Alert;

/**
 * Create an instance of `Alert`.
 *
 * TODO This is not currently modular. It relies on role="alert"
 * 			being present in the template and uses Bootstrap-specific
 * 			classes. Make it modular!
 *
 * @param {HTMLElement} el
 * @api public
 */

function Alert(el) {
  this.el = el;
}

/**
 * Update the text content of the Alert.
 *
 * @param {String} str
 * @return {Alert}
 * @api public
 */

Alert.prototype.text = function (str) {
  this.el.innerHTML = str;
  return this;
};

/**
 * Specify the type of alert message.
 *
 * @param {String} type - ['danger'|'success']
 * @return {Alert}
 * @api public
 */

Alert.prototype.type = function (type) {
  classes(this.el).remove('alert-danger');
  classes(this.el).remove('alert-success');
  classes(this.el).add('alert-' + type);
  return this;
};

/**
 * Show the Alert message.
 *
 * @return {Alert}
 * @api public
 */

Alert.prototype.show = function () {
  classes(this.el).remove('hidden');
  return this;
};

/**
 * Hide the Alert message.
 *
 * @return {Alert}
 * @api public
 */

Alert.prototype.hide = function () {
  classes(this.el).add('hidden');
  return this;
};

}, {"component/classes":6}],
6: [function(require, module, exports) {
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

}, {"indexof":7,"component-indexof":7}],
7: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
5: [function(require, module, exports) {
module.exports = [{"name":"alert.js","code":"\n/**\n * Module dependencies.\n */\n\nvar classes = require('component/classes');\n\n/**\n * Expose `Alert`.\n */\n\nmodule.exports = Alert;\n\n/**\n * Create an instance of `Alert`.\n *\n * TODO This is not currently modular. It relies on role=\"alert\"\n * \t\t\tbeing present in the template and uses Bootstrap-specific\n * \t\t\tclasses. Make it modular!\n *\n * @param {HTMLElement} el\n * @api public\n */\n\nfunction Alert(el) {\n  this.el = el;\n}\n\n/**\n * Update the text content of the Alert.\n *\n * @param {String} str\n * @return {Alert}\n * @api public\n */\n\nAlert.prototype.text = function (str) {\n  this.el.innerHTML = str;\n  return this;\n};\n\n/**\n * Specify the type of alert message.\n *\n * @param {String} type - ['danger'|'success']\n * @return {Alert}\n * @api public\n */\n\nAlert.prototype.type = function (type) {\n  classes(this.el).remove('alert-danger');\n  classes(this.el).remove('alert-success');\n  classes(this.el).add('alert-' + type);\n  return this;\n};\n\n/**\n * Show the Alert message.\n *\n * @return {Alert}\n * @api public\n */\n\nAlert.prototype.show = function () {\n  classes(this.el).remove('hidden');\n  return this;\n};\n\n/**\n * Hide the Alert message.\n *\n * @return {Alert}\n * @api public\n */\n\nAlert.prototype.hide = function () {\n  classes(this.el).add('hidden');\n  return this;\n};\n"},{"name":"index.jade","code":"\nextends ../layout\n\nblock vars\n  - var heading = 'Alert'\n\nblock content\n  .panel.panel-default\n    .panel-heading\n      h2 What is an Alert?\n      \n    .panel-body\n      p An <span class=\"bold\">Alert</span> is a message that contains important information. It is inserted dynamically into the page as a result of some kind of user input and should be announced immediately by screen readers without requiring the user to navigate to the alert message.\n      \n  .panel.panel-default\n    .panel-heading\n      h2 Example: Alert in Response to Form Submission\n      \n    .panel-body\n      p Answer the question below to trigger an alert.\n      form\n        label#label What is the Answer to The Ultimate Question of Life, the Universe, and Everything?\n        .input-group\n          input.form-control(type=\"text\" aria-labelledby=\"label\")\n          span.input-group-btn\n            button.btn.btn-default(type=\"submit\") Submit\n    .panel-body\n      .alert.hidden(role=\"alert\")\n\nblock scripts\n  script(src=\"index.js\")\n\nblock styles\n  link(rel=\"stylesheet\" href=\"index.css\")\n"},{"name":"index.js","code":"\n/**\n * Module dependencies.\n */\n\nvar displaySource = require('../../lib/display-source');\nvar query = require('component/query');\nvar Alert = require('./alert');\n\nvar selectors = {\n  form: 'form',\n  input: 'input[type=text]',\n  submit: 'button',\n  alert: '.alert'\n};\n\nvar form = query(selectors.form);\nvar input = query(selectors.input, form);\nvar submit = query(selectors.submit, form);\nvar alert = new Alert(query(selectors.alert));\n\nform.addEventListener('submit', function (e) {\n  e.preventDefault();\n  alert.hide();\n\n  if (!input.value.length) {\n    alert\n      .text('At least make an effort!')\n      .type('danger');\n  }\n  else if (input.value != '42') {\n    alert\n      .text('Sorry. \"<span class=\"bold\">' + input.value + '</span>\" is not the Answer to The Ultimate Question of Life, the Universe, and Everything')\n      .type('danger');\n  }\n  else {\n    alert\n      .text('Congratulations! \"<span class=\"bold\">42</span>\" is the Answer to The Ultimate Question of Life, the Universe, and Everything')\n      .type('success');\n  }\n\n  input.select();\n  alert.show();\n});\n\n/**\n * Display the source files.\n */\n\ndisplaySource(require('./source'));\n"},{"name":"index.styl","code":"\n@require '../global'\n\n.hidden\n  display none\n\n.bold\n  font-weight 600\n"}];
}, {}]}, {}, {"1":""})