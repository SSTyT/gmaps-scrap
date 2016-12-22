'use strict';

const glob = require('glob');
const config = require('./lib/config');
const Corredor = require('./lib/schemas').corredor;
const logger = require('./lib/logger');
const mongo = require('./lib/mongo');

mongo.connect(config.db.connectionString).then(() => {
  glob('./corredores/*.json', (err, files) => {
    const nameRegex = /\/([^\/]+)\.json$/i;
    let corredores
    if (!err) {
      files.forEach(file => {
        const fileName = nameRegex.exec(file)[1];
        corredores = require(file);
        corredores.forEach(corredor => {
          const id = fileName + corredor.properties.OBJECTID;
          Corredor.findById(id, (err, dbCorredor) => {
            if (!err && !dbCorredor) {
              dbCorredor = new Corredor({ _id: id });
              console.log('Creando corredor ' + corredor.properties['NOMBRE'] + ' tramo ' + corredor.properties['N°_TRAMO_']);
            } else {
              console.log('Modificando corredor ' + corredor.properties['NOMBRE'] + ' tramo ' + corredor.properties['N°_TRAMO_']);
            }

            dbCorredor.type = 'Feature';
            dbCorredor.properties = {
              nombre: corredor.properties['NOMBRE'],
              numTramo: corredor.properties['N°_TRAMO_'],
              tipo: corredor.properties['TIPO'],
              redJerarquica: corredor.properties['RED_JERA_1'],
              alturaInicio: corredor.properties['ALT__INICI'],
              alturaFin: corredor.properties['ALT__FIN'],
              desde: corredor.properties['DESDE_1'],
              hasta: corredor.properties['HASTA_1'],
              flujo: corredor.properties['SENT__FLUJ'],
              sentido: corredor.properties['SENTIDO_1'],
              redTp: corredor.properties['RED_TP_1'] ? true : false,
              bicisenda: (corredor.properties['BICISEND_1'] == '-') ? false : true
            };
            dbCorredor.geometry = {
              type: 'LineString',
              coordinates: corredor.geometry.coordinates
            };

            dbCorredor.save(err => err ? logger.error(err.message) : undefined);

          });
        });
      });
    }
  });
});
