var data    = require('./data');
var util    = require('util');
var us      = require('underscore');
var uuid    = require('node-uuid');
var async   = require('async');

function sendError(socket, errorMessage) {
  socket.emit('error', errorMessage);
}

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {

    // New Game
    socket.on('newGame', function (gameData) {

      // Validating UserName and GameSize
      // ---------------------------------------------
      //var formValues = us.values(gameData);
      // console.log(gameData);
      // console.log(formValues);
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

      if (data.queues[userGameSize] !== null) {
          data.queues[userGameSize].push(socket.id);
      }
      else {
        console.log("Invalid game size");
        sendError(socket, "invalidSize");
        return;
      }

      // ASYNC Series VV

      // Store and Link if necessary
      // ---------------------------------------------
      async.parallel([
        socket.set('userName', userName),
        socket.set('gameSize', userGameSize)
      ],
      function() {
        if (data.queues[userGameSize] >= 2) {
          var socket1 = data.queues[userGameSize].pop();
          var socket2 = data.queues[userGameSize].pop();

          var roomID  = uuid.v4();
          socket.set('roomID', roomID, function() {
            socket1.join(roomID);
            socket2.join(roomID);
            io.sockets.in(roomID).emit("gameStart", {room: roomID, self: userName, opponent: waiting.name});
          });

        }
        else {
          // Tell client to go into waiting mode
          socket.emit('waiting', null);
        }
      });


      // If queue has more than one person waiting, pop them off
      // TODO: Event emit later? For now leave here



      // END ASYNC



      // Store userData in wait queue if no waiting players
      // if (data[userGameSizeQueue].length === 0) {
      //   var queueData = {};
      //   queueData.name = userName;
      //   queueData.socket = socketID;



      //   socket.join(userName);

      // }
      // else {
      //   // If we found a another item in the queue then put both users in room
      //   // and send start game message
      //   var waiting = data[userGameSizeQueue].pop();
      //   socket.join(waiting.name);
      //   console.log("Connected Games into room " + waiting.name);
      //   io.sockets.in(waiting.name).emit("gameStart", {room: waiting.name, self: userName, opponent: waiting.name});
      // }
      // console.log(io.sockets.manager.rooms);
    }); // END startGame




  // Message Forwarders
  socket.on("broadcastGameMessage", function(data) {
    // Forward the message to all people in room except sending socket
    if (data.room !== null) {
      socket.broadcast.to(data.room).emit(data.name, data.message);
    }
  });

  socket.on("emitGameMessage", function(data) {
    // Forward the message to all people in room
    if (data.room !== null) {
      io.sockets.in(data.room).emit(data.name, data.message);
    }
  });



  }); // End .on(connection)

}

