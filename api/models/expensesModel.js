'use strict';

var mongoose = require('mongoose');
var Categories = require('../models/categoriesModel');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;;

var expenseSchema = new Schema({
	description: String,
	dueDate: { type: Date, default: Date.Now },
	scheduledPayment: { type: Boolean, default: false },
	amount: { type: Number, default: 0 },
	category_id: ObjectId,
	_category: { type: Number, ref: 'Category' },
	amountPaid: { type: Number, default: 0 },
	status: { type: String, default: '' },
	notes: String,
	detail: [ {
	 	description: String,
		amount: { type: Number, default: 0 },
		category_id: ObjectId,
		status: String
	} ]
});

module.exports = mongoose.model('Expense', expenseSchema);