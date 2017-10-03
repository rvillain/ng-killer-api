'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MissionSchema = new Schema({
  title: {
    type: String,
    required: 'Enter a mission'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  difficulty: {
    type: [{
      type: String,
      enum: ['action', 'manipulation', 'hardcore']
    }],
    default: ['action']
  },
  game: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
  },
  used: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Mission', MissionSchema);