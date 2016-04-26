
/**
 * Module dependencies.
 */

var validator = require('chriso/validator.js');
var query = require('component/query');
var Form = require('./form');

var formEl = query('form');

new Form(formEl, {

  /**
   * A css selector that can be used in the context of the `formEl`
   * to find the error summary element.
   */

  summarySelector: '.error-summary',

  /**
   * An array of fields that should be validated when the form is submitted.
   *
   * Each object contains:
   * 	1. A name for the field
   *  2. A selector that can be used to locate the field within the form
   *  3. Whether the field is required
   *  4. An array of criteria for the field to pass validation
   *
   * Each criteria object should contain:
   * 	1. An error message that will be displayed if the field fails validation
   * 	2. A function that will validate the field (if valid, returns `true` )
   */

  fields: [
    {
      name: 'name',
      selector: '#name-input',
      isRequired: true,
      criteria: [{
        message: 'Name cannot be left blank.',
        validator: function (val) {
          return !validator.isNull(val);
        }
      }]
    },
    {
      name: 'email',
      selector: '#email-input',
      isRequired: true,
      criteria: [{
        message: 'Email cannot be left blank.',
        validator: function (val) {
          return !validator.isNull(val);
        }
      }, {
        message: 'Email must be a valid email address.',
        validator: function (val) {
          return validator.isEmail(val);
        }
      }]
    }
  ],

  /**
   * A function which, when executed, will return an element reference
   * for a given input field's error message container.
   */

  errorGetter: function (name) {
    return query('.field[data-name="' + name + '"] .error');
  },

  /**
   * A class that can be added to elements to hide them.
   *
   * NOTE: If not provided, will default to setting
   * 			 inline display property to "none".
   */

  hiddenClass: 'hidden'

})
.on('valid-submission', function () {
  this.summary.el.innerHTML = 'Form submitted without errors.';
});
