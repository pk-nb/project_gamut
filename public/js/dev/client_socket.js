/* Socket (echoes events to gamelogic)
 *************************************/
pubsub.subscribe('validPlay', function(context, indexes, piece) {
  socket.emit("piecePlayed", indexes, piece);
});

// update both client's timer
function sentTimer() {
  console.log("sentTimer");
  pubsub.publish("serverClock");
}

function sentMessage() {
   if ($('#chatInput').val() != "")
   {
      emitGameMessage('chatMessage', userName + ': ' +  $('#chatInput').val() );
      $('#chatInput').val('');
   }
}

function startGame(gameParams) {
  socket.emit('newGame', gameParams);
}

function userValidated() {
  pubsub.publish('newGameRequested');
}

function sendPoke() {
  console.log(userName + "sent poke to room " + currentRoom);
  //socket.emit('poke', "Someone poked you");
  emitGameMessage('poke', userName + " poked you");
}

function broadcastGameMessage(name, message) {
  // Generic message to send
  if (currentRoom != null) {
    socket.emit("broadcastGameMessage", { name: name, message: message, room: currentRoom });
  }
}

function emitGameMessage(name, message) {
  // Generic message to send
  if (currentRoom != null) {
    socket.emit("emitGameMessage", { name: name, message: message, room: currentRoom });
  }
}

socket.on('timerUpdate', function(data) {
  printTimer(data);
});

socket.on('poke', function(data) {
  printFeedback(data);
});

socket.on('chatMessage', function(data) {
  printChat(data);
});


// GETTING message Display message on client-recieve
socket.on('gameStart', function(data) {
  // Forward data to client events
  pubsub.publish("gameStart", null, data);
});

// timer test
socket.on('timer', function(data) {
  if (gameOn) {
    //timer++;
    sentTimer();
  }
});

socket.on("selfUpdateBoard", function(indexes, piece) {
  // console.log("Ok to play piece: ");
  pubsub.publish("selfUpdateBoard", null, indexes, piece);
});

socket.on("opponentUpdateBoard", function(indexes, piece) {
  // console.log("Opponent played piece: ");
  pubsub.publish("opponentUpdateBoard", null, indexes, piece);
});

socket.on("posPlayed", function() {
  console.log("Position already taken by old play.")
});

socket.on("error", function(errorMessage) {
  if (errorMessage === "nameDuplicate") {
    // Let know user that the name is not allowed
  }
});

socket.on("nameOK", function() {
  // Go into waiting list
  userValidated();
});
