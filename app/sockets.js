var data = require('./data');

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {

    socket.get('newGame', function (error, name) {

    });

  });

}

