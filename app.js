var express = require('express');
var jade = require('jade');
var http = require('http');

var app = express();

// Project Settings
//
app.set('port', process.env.PORT || 3000);
app.set('views', (__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', function(req, res){
  res.render('index.jade');
});


// Socket Stuff
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

});

server.listen(3000);
