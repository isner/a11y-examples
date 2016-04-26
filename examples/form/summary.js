
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');

/**
 * Expose `Summary`.
 */

module.exports = Summary;

function Summary(el, opts) {
  this.el = el.nodeType ? el : query(el);
  this.opts = opts || {};

  this.events = events(this.el, this);
  this.events.bind('click a.jump', 'jumpToError');
  this.events.bind('keydown a.jump');
  this.events.bind('keydown');
  this.events.bind('blur');

  this.hide();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Summary.prototype);

Summary.prototype.show = function () {
  if (this.opts.hiddenClass) {
    classes(this.el).remove(this.opts.hiddenClass);
  }
  else {
    this.el.style.display = 'block';
  }
};

Summary.prototype.hide = function () {
  if (this.opts.hiddenClass) {
    classes(this.el).remove(this.opts.hiddenClass);
  }
  else {
    this.el.style.display = 'none';
  }
};

Summary.prototype.update = function (errCount) {
  if (errCount === 0) {
    return;
  }
  this.el.innerHTML = '';

  var msg = document.createElement('span');
  var link = document.createElement('a');
  link.setAttribute('tabindex', '0');
  link.className = 'jump';

  msg.innerHTML = [
    'There',
    errCount < 2 ? 'is' : 'are',
    errCount,
    errCount < 2 ? 'error' : 'errors',
    'in the form.'
  ].join(' ');

  link.innerHTML = [
    'Go to',
    errCount < 2 ? 'the error.' : 'the first error.'
  ].join(' ');

  this.el.appendChild(msg);
  this.el.appendChild(link);
};

Summary.prototype.jumpToError = function () {
  this.emit('jump-to-error');
};

Summary.prototype.onkeydown = function (e) {
  if (e.which === 13) {
    e.preventDefault();
    if (e.target.nodeName == 'A') {
      this.jumpToError();
    }
  }
};

Summary.prototype.onblur = function () {
  this.el.removeAttribute('tabindex');
};

Summary.prototype.applyFocus = function () {
  var summary = this;
  setTimeout(function () {
    summary.el.setAttribute('tabindex', '-1');
    summary.el.focus();
  }, 100);
};
