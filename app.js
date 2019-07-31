const key = "486f33fc2844e75c45946fdba50fe616";//api clima
let express = require('express');
let app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('files'));
let axios = require('axios');
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
var datos = [];
client.on('connect', function() {
  console.log('conectado a Redis');
  //guardo las ciudades en Redis
  const redisValue = JSON.stringify(ciudades);
  client.set('cities', redisValue, function(err, reply) {
      //console.log(reply);
  });

  client.get('cities', function(err, reply) {
    //console.log(JSON.parse(reply));
    cities = JSON.parse(reply);

    cities.map(function (city,index) {
      //console.log(city.lat);
      let endpoint = 'https://api.darksky.net/forecast/'+key+'/'+city.lat+','+city.long;
      axios.get(endpoint).then(resp => {
          //console.log(resp.data);
          resp.data.currently.temperature = temperatureConverter(resp.data.currently.temperature);
          resp.data.currently.time = dateConverter(resp.data.currently.time);
          datos[index] = resp.data;
          console.log(datos);
      });

    });

  });
});

//express begin
app.get('/', function (req, res) {
  let data = {'titulo':'Forecast','datos':datos};
  res.render('index',data);
});

//https://api.darksky.net/forecast/486f33fc2844e75c45946fdba50fe616/37.8267,-122.4233
app.listen(3000, function () {
  console.log('corriendo en el puerto 3000');
});

//helpers
function temperatureConverter(valNum) {
  valNum = parseFloat(valNum);
  return (valNum-32) / 1.8;
}

function dateConverter(unixtimestamp){
 // Months array
 var months_arr = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

 // Convert timestamp to milliseconds
 var date = new Date(unixtimestamp*1000);

 // Year
 var year = date.getFullYear();

 // Month
 var month = months_arr[date.getMonth()];

 // Day
 var day = date.getDate();

 // Hours
 var hours = date.getHours();

 // Minutes
 var minutes = "0" + date.getMinutes();

 // Seconds
 var seconds = "0" + date.getSeconds();

 // Display date time in MM-dd-yyyy h:m:s format
 var convdataTime = day+'/'+month+'/'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

 return convdataTime;

}
