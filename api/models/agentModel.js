'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AgentSchema = new Schema({
  name: {
    type: String,
    required: 'Enter a name'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  mission: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
  },
  target: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
  },
  status: {
    type: String,
    enum: ['alive', 'dead'],
    default: 'alive'
  },
  life: {
    type: Number,
    default: 3
  },
  code: {
    type: String
  },
  photo: {
    type: String
  },
  game: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
  }

}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Agent', AgentSchema);