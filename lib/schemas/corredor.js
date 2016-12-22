'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('q').Promise;

const corredorPropertiesSchema = new Schema({
  nombre: String,
  numTramo: Number,
  tipo: String,
  redJerarquica: String,
  alturaInicio: Number,
  alturaFin: Number,
  desde: String,
  hasta: String,
  flujo: String,
  sentido: String,
  redTp: Boolean,
  bicisenda: Boolean
});

const corredorGeometrySchema = new Schema({
  type: String,
  coordinates: [
    [Number]
  ]
});

const corredorSchema = new Schema({
  _id: String,
  type: String,
  properties: corredorPropertiesSchema,
  geometry: corredorGeometrySchema
});

module.exports = mongoose.model('Corredor', corredorSchema);
