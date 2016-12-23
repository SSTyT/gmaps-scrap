'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

const speedSchema = new Schema({
  corredor: String,
  ida: Number,
  vuelta: Number,
  timestamp: Date
});

module.exports = mongoose.model('Speed', speedSchema);
