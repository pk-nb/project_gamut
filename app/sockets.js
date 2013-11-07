var data = require('./data');
var util = require('util');
var us   = require('underscore');

module.exports = function(io) {

  io.sockets.on('connection', function (socket) {


    // New Game
    socket.on('newGame', function (gameData) {

      console.dir(socket);

      var userName = gameData[0].value;

      // Prevent duplicate names
      if (!us.contains(data.users, userName)) {
        data.users.push(userName);

      } else {
        // Send message back to client
        console.log("Name duplicate rejected");
        return;
      }

      //console.dir(data.users);
      var userGameSize = gameData[1].value;

      // Store userData in wait queue if no waiting players
      if (data[userGameSize + "Queue"].length === 0) {

        var queueData = {};
        queueData.name = userName;
        //queueData.socket = socket;

        switch (userGameSize) {
          case "small":  // Put in small queue
            data.smallQueue.push(queueData);
            break;
          case "medium": // Put in medium queue
            data.mediumQueue.push(queueData);
            break;
          case "large":  // Put in large
            data.largeQueue.push(queueData);
            break;
          default:
            // invalid game size
            // send message back to user about error
            console.log("Invalid game size");
            break;
        }

        // Tell client to go into waiting mode
        socket.join(userName);

      }
      else {
        // If we found a another item in the queue then put both users in room
        // and send start game message
        var waiting = data[userGameSize + "Queue"].pop();
        socket.join(waiting.name);
        console.log("Connected Games");
        io.sockets.in(waiting.name).emit("gameStart", {self: userName, opponent: waiting.name});
      }


      console.log(io.sockets.manager.rooms);
    }); // END startGame


  // Room play

  }); // End .on(connection)

}

