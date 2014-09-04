var express = require('express');
var jade = require('jade');
var http = require('http');

// Project Initialization & Settings
var app = express();
var env = process.env.NODE_ENV || 'development';

//app.set('port', process.env.PORT || 3000);

process.env.PWD = process.cwd()

app.set('views', (process.env.PWD + '/views'));
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(process.env.PWD + '/public'));


// Socket Configuration
var server = http.createServer(app);
var io = require('socket.io').listen(server);
require('./app/sockets')(io);

// Routes
require('./app/routes')(app);

console.log("hey");

server.listen(process.env.PORT || 3000);
