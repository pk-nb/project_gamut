/* Socket (echoes events to gamelogic)
 *************************************/


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



socket.on('poke', function(data) {
  printFeedback(data);
});

socket.on('chatMessage', function(data) {
  printChat(data);
});



// GETTING message Display message on client-recieve
socket.on('gameStart', function(data) {
  socket.emit('timer', data); // start timer
  console.log(data);
  printFeedback(data.self + " VS " + data.opponent);
  currentRoom = data.room; // Save the room so we know who to talk to
  pubsub.publish('gameStart');
});
