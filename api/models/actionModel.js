'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ActionSchema = new Schema({
  type: {
    type: String
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
  }

}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Action', ActionSchema);