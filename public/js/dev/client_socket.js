/* Socket (echoes events to gamelogic)
 *************************************/

// update both client's timer
function sentTimer() {
  emitGameMessage('timerUpdate', timer );
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
  console.log(data);
  printFeedback(data.self + " VS " + data.opponent);
  currentRoom = data.room; // Save the room so we know who to talk to
  pubsub.publish('gameStart');
  gameOn = true; // when game start set to true, timer starts
});

// timer test
socket.on('timer', function (data) {
  if (gameOn) {
    timer++;
    sentTimer();
  }
});