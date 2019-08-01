const key = "486f33fc2844e75c45946fdba50fe616";//api clima
//const key = "4c0e8eaded48c217f8175373310724e5";
const http = require('http');
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.static('files'));
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);//iniciando el server de socket.io
const axios = require('axios');
const redis = require('redis'),client = redis.createClient();
let datos = [];
let error_api = false;

let ciudades = [{'lat':'-33.6012253','long':'-71.2993392'},
                {'lat':'47.3775499','long':'8.4666752'},
                {'lat':'-36.8621448','long':'174.5852863'},
                {'lat':'-33.8567799','long':'151.213108'},
                {'lat':'51.5287718','long':'-0.2416814'},
                {'lat':'51.5287718','long':'-0.2416814'},
                {'lat':'32.6627876','long':'-85.4219787'}
               ];
let cities = null;

client.on('connect', function() {
  console.log('conectado a Redis');
  //guardo las ciudades en Redis
  let redisValue = JSON.stringify(ciudades);
  client.set('cities', redisValue, function(err, reply) {
      //console.log(reply);
  });

  client.get('cities', function(err, reply) {
    //console.log(JSON.parse(reply));
    cities = JSON.parse(reply);
  });
});


function getData(){
  var probabilidad = Math.random() * 1;
  console.log('probabilidad:'+probabilidad);
  if (probabilidad < 0.1){
    //este error bota la app por eso lo comente, descomentar para que funcione
    //throw new Error('How unfortunate! The API Request Failed');
    var tiempo = new Date().getTime();
    client.hmset('api.errors', {tiempo : 'How unfortunate! The API Request Failed'}, (err, reply) => {
      error_api = true;
    });
  }else{
    error_api=false;
    Object.keys(cities).forEach(function(index) {
      let endpoint = 'https://api.darksky.net/forecast/'+key+'/'+cities[index].lat+','+cities[index].long;
      //console.log(endpoint);
      axios.get(endpoint).then(resp => {
          //console.log(resp.data);
          resp.data.currently.temperature = temperatureConverter(resp.data.currently.temperature);
          resp.data.currently.time = dateConverter(resp.data.currently.time);
          datos[index] = resp.data;
          //datos.push(resp.data);
      }).catch(error => {
        console.log(error)
        //datos[index] = error
      });
    });
  }//endif 10%
}


const PORT = process.env.PORT || 5000

//puerto del servidor
server.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`)
})


//socketio
io.on('connection', function(socket){
  console.log(`client: ${socket.id}`)
  getData();
  console.log(datos);
  if(error_api){
    socket.emit('server/data', {'error':'How unfortunate! The API Request Failed'})
  }else{
    socket.emit('server/data', {'datos':datos})
  }


  //enviando data diez segundo al cliente
  setInterval(() => {
    getData();
    if(error_api){
      socket.emit('server/data', {'error':'How unfortunate! The API Request Failed'})
    }else{
      socket.emit('server/data', {'datos':datos})
    }
  }, 10000);

})


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
