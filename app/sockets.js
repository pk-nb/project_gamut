var data          = require('./data');
var util          = require('util');
var us            = require('underscore');
var uuid          = require('node-uuid');
var async         = require('async');
var EventEmitter  = require('events').EventEmitter;

// Modify Data object to have functions to trigger on event
util.inherits(data.Queues, EventEmitter);

// Put socket in queue, and send event if size over 2 to connect
data.Queues.prototype.pushSocket = function(io, socket) {
  socket.get('gameSize', function(err, gameSize) {
    queues[gameSize].push(socket.id);
    if (queues[gameSize].length >= 2) {
      queues.emit('connectTwo', io, gameSize);
    }
    else {
      socket.emit('waiting', null);             // Tell client to go into waiting mode
    }
  });
}

// Connects two games on message of 2+ in queue
var queues = new data.Queues();
queues.on('connectTwo', function(io, userGameSize) {
  var socketid1 = this[userGameSize].pop();
  var socketid2 = this[userGameSize].pop();

  var roomID  = uuid.v4();                      // Generate a unique room name ID
  io.sockets.socket(socketid1).join(roomID);
  io.sockets.socket(socketid2).join(roomID);

  async.parallel([
    function (callback) { io.sockets.socket(socketid1).get('userName',       callback); },
    function (callback) { io.sockets.socket(socketid2).get('userName',       callback); },
    function (callback) { io.sockets.socket(socketid1).set('roomID', roomID, callback); },
    function (callback) { io.sockets.socket(socketid2).set('roomID', roomID, callback); }
  ],
  function(err, result) {
    // Usernames in result[0] and result[1]
    io.sockets.in(roomID).emit("gameStart", {room: roomID, self: result[0], opponent: result[1]});
  });
});

// Validate client form, expecting array of objects with value fields
// [ { ..., 'value' : userName }, {..., 'value': gameSize} ]
function formValid(gameData, socket) {
  var userName = gameData[0].value;
  var userGameSize = gameData[1].value;

  // Prevent duplicate names
  if (us.contains(data.users, userName) || userName.length == 0) {
    console.log("Name duplicate rejected");
    sendError(socket, "nameDuplicate");
    return false;
  }
  // Validate gameSize
  if (!us.has(queues, userGameSize)) {
    queues[userGameSize].push(socket.id);
    console.log("Invalid game size");
    sendError(socket, "invalidSize");
    return false;
  }
  return true;
}


// Send specificed error message to client
function sendError(socket, errorMessage) {
  socket.emit('error', errorMessage);
}

module.exports = function(io) {
  io.sockets.on('connection', function (socket) {

    // Initial message from new game form on client
    socket.on('newGame', function (gameData) {
      if (formValid(gameData, socket)) {
        var userName = gameData[0].value;
        var userGameSize = gameData[1].value;

        data.users.push(userName);

        // Initialize board array data
        var boardArray = [];
        for (var row = 0; row < data.types.sizes[userGameSize].arrayLength; row++) {
          boardArray[row] = [];
          for (var column = 0; column < data.types.sizes[userGameSize].arrayLength; column++) {
            boardArray[row][column] = false;
          };
        };
        // Store both vars then run call back pushing socket onto queue
        async.parallel([
          function(callback) { socket.set('userName', userName, callback); },
          function(callback) { socket.set('gameSize', userGameSize, callback); },
          function(callback) { socket.set('boardArray', boardArray, callback); }
        ],
        function() {
          queues.pushSocket(io, socket);
        });
      }
    }); // END startGame

    // Server stores which pieces have been placed and notifies clients
    socket.on('piecePlayed', function(coordinates){
      // get boardArray from socket
      socket.get('boardArray', function(err, boardArray) {
        var positionPlayed = false; // flag
        for (var a = 0; a < coordinates.length && positionPlayed == false; a++) {
          if (boardArray[coordinates[a].i][coordinates[a].j] == true)
            positionPlayed = true; // if coordinate has been played, end loop and flag is true
        };

        if (positionPlayed == false) { 
        // it's OK to play
          for (var a = 0; a < coordinates.length; a++) {
            boardArray[coordinates[a].i][coordinates[a].j] == true; // set pieces to true
            socket.get('roomID', function(err, roomID) {
              var roster = io.sockets.clients(roomID); // get clients in the room
              //console.log(roster);
              for(id in roster) {
                var _socket = roster[id];
                _socket.set('boardArray', boardArray); // save boardArray in all the clients' sockets 
              };
            });
          };
          /* TO DO
            - Test that it is emitting only to sender
            */
          // emit message to (only) player that it's OK to play piece
          io.sockets.socket(socket.id).emit("updateBoard", coordinates);
          // emit message to (only) enemy of what piece was played
          socket.get('roomID', function(err, roomID) {
              io.sockets.in(roomID).emit("updateBoard", coordinates);
          });
        }
        else{ // positionPlayed == true
        // emit message to player that it is NOT OK to play piece
          io.sockets.socket(socket.id).emit("posPlayed", coordinates);
        }
      });
    });

    // Disconnect Logic (drop username, drop if in queue, optional gamesave logic)
    socket.on('disconnect', function() {
      // Clear username
      socket.get('userName', function(err, userName) {
        data.users = us.without(data.users, userName);
      });

      var queued = us.union(queues.small, queues.medium, queues.large);
      if (us.contains(queued, socket.id)) {
        socket.get('gameSize', function(err, gameSize) {
          queues[gameSize] = us.without(queues[gameSize], socket.id); // Drop from queue
        });
      }
    });

    // Message Forwarders
    // Forward the message to all people in room except sending socket
    socket.on('broadcastGameMessage', function(message) {
      socket.get('roomID', function(err, roomID) {
        socket.broadcast.to(roomID).emit(message.name, message.message);
      });
    });

    // Forward the message to all people in room
    socket.on('emitGameMessage', function(message) {
      socket.get('roomID', function(err, roomID) {
        io.sockets.in(roomID).emit(message.name, message.message);
      });
    });

    // Timer logic
    setInterval(function() {
      data.timer;
      socket.emit('timer', { timer: data.timer });
    }, 500);

  }); // END .on(connection)
} // END module.exports

