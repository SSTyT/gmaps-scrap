'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

const speedSchema = new Schema({
  _id: String
});

module.exports = mongoose.model('Speed', speedSchema);
