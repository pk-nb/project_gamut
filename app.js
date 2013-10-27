var express = require('express');
var jade = require('jade');
var http = require('http');

// Project Initialization & Settings
var app = express();
var env = process.env.NODE_ENV || 'development';

//app.set('port', process.env.PORT || 3000);
app.set('views', (__dirname + '/views'));
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));


// Socket Configuration
var server = http.createServer(app);
var io = require('socket.io').listen(server);
require('./app/sockets')(io);

// Routes
require('./app/routes')(app);

server.listen(3000);
