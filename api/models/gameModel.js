'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GameSchema = new Schema({
  name: {
    type: String,
    required: 'Enter a name'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['created', 'started', 'finished'],
    default: 'created'
  }
}, { toJSON: { virtuals: true } });

GameSchema.virtual('missions', {
  ref: 'Mission', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'game', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});
GameSchema.virtual('actions', {
  ref: 'Action', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'game', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});
GameSchema.virtual('agents', {
  ref: 'Agent', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'game', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});
module.exports = mongoose.model('Game', GameSchema);