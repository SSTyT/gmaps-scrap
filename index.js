'use strict';

const crypto = require('crypto');
const querystring = require('querystring');
const fs = require('fs');
const URLSafeBase64 = require('urlsafe-base64');
const request = require('request');
const sem = require('semaphore')(10);

const config = require('./lib/config');
const mongo = require('./lib/mongo');
const schemas = require('./lib/schemas');
const Corredor = schemas.corredor;
const Speed = schemas.speed;

const signUrl = (privateKey, url) => {
  const privateKeyDecoded = URLSafeBase64.decode(privateKey);
  const hash = crypto.createHmac('sha1', privateKeyDecoded).update(url).digest();
  const signature = URLSafeBase64.encode(hash);
  return `${url}&signature=${signature}`;
}

const callApi = (from, to, waypoints, id, field) => {
  const args = {
    alternatives: false,
    departure_time: 'now',
    mode: 'driving',
    origin: from,
    destination: to,
    waypoints: waypoints.map(value => `via:${value[1]},${value[0]}`).join('|'),
    client: config.gmaps.clientId
  }

  const url = 'http://maps.googleapis.com' + signUrl(config.gmaps.privateKey, `/maps/api/directions/json?${querystring.stringify(args)}`);
  sem.take(() => {
    request(url, (error, response, body) => {
      sem.leave();
      const distance = JSON.parse(body).routes[0].legs[0].distance.value;
      const time = JSON.parse(body).routes[0].legs[0].duration_in_traffic.value;

      let fields = {
        corredor: id,
        timestamp: new Date()
      }

      fields[field] = Math.round(distance / time * 3.6);

      const speed = new Speed(fields);
      speed.save(err => {
        if (err) {
          console.log(err);
        } else {
          console.log(fields);
        }

      });
    });
  });
}

let corredores;

const getData = () => {
  corredores.forEach(corredor => {
    let from = corredor.geometry.coordinates[0];
    let to = corredor.geometry.coordinates[corredor.geometry.coordinates.length - 1];
    let waypoints = [];

    if (corredor.geometry.coordinates.length - 2 > 5) {
      const first = Math.round(corredor.geometry.coordinates.length * 0.25);
      const second = Math.round(corredor.geometry.coordinates.length * 0.5);
      const third = Math.round(corredor.geometry.coordinates.length * 0.75);
      waypoints.push(corredor.geometry.coordinates[first]);
      waypoints.push(corredor.geometry.coordinates[second]);
      waypoints.push(corredor.geometry.coordinates[third]);
    } else {
      for (let i = 1; i < corredor.geometry.coordinates.length - 1; i++) {
        waypoints.push(corredor.geometry.coordinates[i]);
      }
    }

    callApi(`${from[1]},${from[0]}`, `${to[1]},${to[0]}`, waypoints, corredor._id, 'ida');

    if (corredor.flujo == 'AMBOS') {
      callApi(`${to[1]},${to[0]}`, `${from[1]},${from[0]}`, waypoints.reverse(), corredor._id, 'vuelta');
    }
  });
}

mongo.connect(config.db.connectionString).then(() => {
  Corredor.find({}, (err, corredoresDb) => {
  	console.log(corredoresDb.length);
    corredores = corredoresDb;
    getData();
    setInterval(getData, 60000 * 30);
  });
});