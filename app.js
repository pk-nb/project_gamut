var express = require('express');
var jade = require('jade');
var http = require('http');
var sass = require('node-sass')

// Project Initialization & Settings
var app = express();
var env = process.env.NODE_ENV || 'development';

//app.set('port', process.env.PORT || 3000);

// process.env.PWD = process.cwd()

// console.log (process.env.PWD);

app.set('views', (__dirname + '/views'));
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// adding the sass middleware
app.use(
   sass.middleware({
       src: __dirname + '/public/sass',
       dest: __dirname + '/public',
       debug: true
   })
);

app.use(express.static(__dirname + '/public'));

// Socket Configuration
var server = http.createServer(app);
var io = require('socket.io').listen(server);
require('./app/sockets')(io);

// Routes
require('./app/routes')(app);

console.log("hey");

server.listen(process.env.PORT || 3000);
