'use strict';

const glob = require('glob');

glob('./corredores/*.json', (err, files) => {
  const nameRegex = /\/([^\/]+)\.json$/i;
  let corredores
  if (!err) {
    files.forEach(file => {
      const fileName = nameRegex.exec(file)[1];
      corredores = require(file);
    });
  }
});
