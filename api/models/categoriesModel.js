'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
 	name: String,
	type: String,
	totalAmount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
