'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var VoteSchema = new Schema({
  Created_date: {
    type: Date,
    default: Date.now
  },
  agent: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
  },
  game: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
  },
  tribunal: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribunal'
  },
  choice: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
  }

}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Vote', VoteSchema);