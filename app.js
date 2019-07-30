let express = require('express');
let app = express();
let axios = require('axios');
app.set('view engine', 'ejs');
let redis = require('redis'),client = redis.createClient();

let ciudades = [{'lat':'-33.6012253','long':'-71.2993392'},
                {'lat':'47.3775499','long':'8.4666752'},
                {'lat':'-36.8621448','long':'174.5852863'},
                {'lat':'-33.8567799','long':'151.213108'},
                {'lat':'51.5287718','long':'-0.2416814'},
                {'lat':'51.5287718','long':'-0.2416814'},
                {'lat':'32.6627876','long':'-85.4219787'}
               ];
let cities = null;
let datos = null;
client.on('connect', function() {
  console.log('conectado a Redis');
  //guardo las ciudades en Redis
  const redisValue = JSON.stringify(ciudades);
  //console.log(redisValue);
  client.set('cities', redisValue, function(err, reply) {
      //console.log(reply);
  });

  client.get('cities', function(err, reply) {
    //console.log(JSON.parse(reply));
    cities = JSON.parse(reply);

    cities.map(function (city) {
      console.log(city.lat);
    });


  });


});



app.get('/', function (req, res) {
  let data = {'titulo':'Forecast','ciudades':cities};
  res.render('index',data);
});

//https://api.darksky.net/forecast/486f33fc2844e75c45946fdba50fe616/37.8267,-122.4233
app.listen(3000, function () {
  console.log('corriendo en el puerto 3000');
});
