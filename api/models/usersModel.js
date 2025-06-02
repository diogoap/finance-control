'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	emailAuthorized: { type: String, required: true, unique: true, index: true },
	creationDate: { type: Date, default: Date.now },
	externalId: { type: String, required: true },
	externalName: { type: String, required: true },
	externalPhoto: { type: String, required: true },
	userEnabled: { type: Boolean, default: true },
	accessTokens: [ {
		token: { type: String, required: true },
		creationDate: { type: Date, default: Date.now }
	} ]
});

// Add indexes for better performance
userSchema.index({ emailAuthorized: 1 });
userSchema.index({ externalId: 1 });

module.exports = mongoose.model('User', userSchema);
