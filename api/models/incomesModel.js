'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var incomeSchema = new Schema({
	description: String,
	dueDate: { type: Date, default: Date.Now },
	amount: { type: Number, default: 0 },
	category_id: String,
	_categoryNames: String,
	_category: Object,
	account_id: String,
	_accountNames: String,
	_account: Object,
	amountReceived: { type: Number, default: 0 },
	status: { type: String, default: '' },
	notes: String,
	user_id: String,
	currency_id: String,
	_currency: Object,	
	detail: [ {
	 	description: String,
		amount: { type: Number, default: 0 },
		category_id: ObjectId,
		_category: Object,
		account_id: ObjectId,
		_account: Object,
		status: String,
		currency_id: String,
		_currency: Object
	} ]
});

module.exports = mongoose.model('Income', incomeSchema);
