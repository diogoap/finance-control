'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var loanSchema = new Schema({
	description: String,
	transactionDate: { type: Date, default: Date.Now },
	dueDate: { type: Date, default: Date.Now },
	amount: { type: Number, default: 0 },
	account_id: String,
	_account: Object,
	type: { type: String, default: '' },
	status: { type: String, default: '' },
	notes: String,
	user_id: String,
	currency_id: String,
	_currency: Object,	
});

module.exports = mongoose.model('Loan', loanSchema);
