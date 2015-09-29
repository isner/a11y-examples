
/**
 * Module dependencies.
 */

var DialogModal = require('./dialog-modal');
var query = require('component/query');

/**
 * Define arguments.
 */

var trigger = query('#ex-basic .btn-default');
var content = require('./modal-body.html');
var title = 'Types of Message Dialogs';

/**
 * Create a dialog-modal using the above arguments.
 */

new DialogModal(trigger, content, title);
