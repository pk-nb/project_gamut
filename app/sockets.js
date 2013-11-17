var data    = require('./data');
var util    = require('util');
var us      = require('underscore');
var uuid    = require('node-uuid');
var async   = require('async');
var EventEmitter = require(‘events’).EventEmitter;

// util.inherits(data, EventEmitter);

// data.prototype.queueConnect


function sendError(socket, errorMessage) {
  socket.emit('error', errorMessage);
}

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {

    // New Game
    socket.on('newGame', function (gameData) {

      // Validating UserName and GameSize
      // ---------------------------------------------
      var userName = gameData[0].value;

      // Prevent duplicate names
      if (!us.contains(data.users, userName)) {
        data.users.push(userName);
      }
      else {
        console.log("Name duplicate rejected");
        sendError(socket, "nameDuplicate");
        return;
      }

      var userGameSize = gameData[1].value;

      if (us.has(data.queues, userGameSize)) {
        data.queues[userGameSize].push(socket.id);
      }
      else {
        console.log("Invalid game size");
        sendError(socket, "invalidSize");
        return;
      }


      // Use .wait() to reduce complexity
      // Set user information, then check if two games can be connected
      socket.set('userName', userName , function() {
        socket.set('gameSize', userGameSize, function() {
          if (data.queues[userGameSize].length >= 2) {
            var socketid1 = data.queues[userGameSize].pop();
            var socketid2 = data.queues[userGameSize].pop();

            var roomID  = uuid.v4(); // Generate a unique room name ID
            io.sockets.socket(socketid1).join(roomID);
            io.sockets.socket(socketid2).join(roomID);

            io.sockets.socket(socketid1).get('userName', function(err, name1) {
              io.sockets.socket(socketid2).get('userName', function(err, name2) {

                // Store RoomID on sockets
                io.sockets.socket(socketid1).set('roomID', roomID, function() {
                  io.sockets.socket(socketid2).set('roomID', roomID, function() {
                    // Emit signal to start game
                    io.sockets.in(roomID).emit("gameStart", {room: roomID, self: name1, opponent: name2});
                  });
                }); // End set roomIDs
              });
            }); // End get usernames

          }
          else {
            // Tell client to go into waiting mode
            socket.emit('waiting', null);
          }
        });
      }); // END socket.set
    }); // END startGame


    // Disconnect Logic (drop if in queue, gamesave logic if in game)
    socket.on('disconnect', function() {
      var queued = us.union(data.queues.small, data.queues.medium, data.queues.large);
      if (us.contains(queued, socket.id)) {
        socket.get('gameSize', function(err, gameSize) {
          data.queues[gameSize] = us.without(data.queues[gameSize], socket.id); // Drop from queue
        });
      }
    });

    // Message Forwarders
    socket.on('broadcastGameMessage', function(data) {
      // Forward the message to all people in room except sending socket
      socket.get('roomID', function(err, roomID) {
        // Optional data validation
        socket.broadcast.to(roomID).emit(data.name, data.message);
      });
    });

    socket.on('emitGameMessage', function(data) {
      // Forward the message to all people in room
      socket.get('roomID', function(err, roomID) {
        io.sockets.in(roomID).emit(data.name, data.message);
      });

    });

  }); // END .on(connection)

}

