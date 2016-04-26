
/**
 * Module dependencies.
 */

var tokenAttr = require('../../lib/token-attr');
var rndid = require('stephenmathieson/rndid');
var Emitter = require('component/emitter');
var events = require('component/events');
var query = require('component/query');
var Summary = require('./summary');

/**
 * Expose `Form`.
 */

module.exports = Form;

function Form(el, config) {
  this.form = el.nodeType ? el : query(el);
  this.config = config || {};
  this.errorGetter = this.config.errorGetter;
  this.fields = this.config.fields;

  var form = this;
  this.summary = new Summary(this.config.summarySelector)
    .on('jump-to-error', form.focusFirstError);

  this.events = events(this.form, this);
  this.events.bind('submit', 'validate');

  this.init();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Form.prototype);

Form.prototype.init = function () {
  this.fields.forEach(function (field) {
    if (field.isRequired) {
      var input = query(field.selector);
      if (input && input.nodeType) {
        input.setAttribute('aria-required', 'true');
      }
    }
  });
};

Form.prototype.validate = function (e) {
  e.preventDefault();
  this.clearErrors();

  var form = this;
  var errCount = 0;

  this.fields.forEach(function (field) {
    var input = query(field.selector);
    if (input && input.nodeType) {
      field.criteria.forEach(function (criterion) {
        var res = criterion.validator(input.value);
        if (!res) {
          form.showError(field, criterion);
          errCount++;
        }
      });
    }
  });
  this.summary.update(errCount);
  this.summary.show();
  this.summary.applyFocus();

  if (errCount === 0) {
    this.emit('valid-submission');
  }
};

Form.prototype.clearErrors = function (e) {
  var form = this;

  this.fields.forEach(function (field) {
    var input = query(field.selector);
    var error = form.errorGetter(field.name);

    input.removeAttribute('aria-invalid');
    tokenAttr.remove(input, 'aria-describedby', error.id);
    error.innerHTML = '';
  });
};

Form.prototype.showError = function (field, criterion) {
  var input = query(field.selector);
  var error = this.errorGetter(field.name);
  var message = criterion.message;

  error.innerHTML = [ error.innerHTML, '<div>', message, '</div>' ].join('');
  error.id = error.id || rndid();
  tokenAttr.add(input, 'aria-describedby', error.id);
  input.setAttribute('aria-invalid', 'true');
};

Form.prototype.focusFirstError = function () {
  var first = query('[aria-invalid]', this.form);
  first.focus();
};
