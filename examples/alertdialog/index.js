
/**
 * Module dependencies.
 */

var DialogModal = require('../../lib/dialog-modal/dialog-modal.js');
var query = require('component/query');

/**
 * Define arguments.
 */

var trigger = query('#ex-basic .btn-default');
var content = require('./modal-body.html');
var title = 'Example Alert';

/**
 * Create an alert-dialog using the above arguments.
 */

new DialogModal(trigger, content, title, true);
