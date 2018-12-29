'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var currencySchema = new Schema({
	currencyCode: String,
	currencySymbolImage: String,
	default: { type: Boolean, default: false },
	enabled: { type: Boolean, default: true },
	user_id: String,
	periods: [ {
		beginDate: { type: Date, default: Date.now },
		endDate: { type: Date, default: Date.now },		
		conversionRate: { type: Number, default: 1 }
   } ]	
});

module.exports = mongoose.model('Currency', currencySchema);
