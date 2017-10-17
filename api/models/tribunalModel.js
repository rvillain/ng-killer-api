'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TribunalSchema = new Schema({
  status: {
    type: String,
    enum: ['created', 'started', 'finished'],
    default: 'created'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  killer: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
  },
  target: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
  },
  game: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
  },

}, { toJSON: { virtuals: true } });

TribunalSchema.virtual('votes', {
    ref: 'Vote', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'tribunal', // is equal to `foreignField`
    justOne: false
  });

module.exports = mongoose.model('Tribunal', TribunalSchema);