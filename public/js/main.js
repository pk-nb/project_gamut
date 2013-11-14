var socket = io.connect();


// Global app parameters
var currentRoom = null;
var userName    = "nobody";


function printFeedback(string) {
  $('#feedback').append("<p>" + string + "</p>");
}

/* Socket
 *************************************/
function startGame(gameParams) {
  socket.emit('newGame', gameParams);
  $('#newGameDiv').hide();
  $('#feedback').show();
  // View manimpulation (hide form, load game div)
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

// GETTING message Display message on client-recieve
socket.on('gameStart', function(data) {
  console.log(data);
  printFeedback(data.self + " VS " + data.opponent);
  currentRoom = data.room; // Save the room so we know who to talk to
  console.log()
});


/* View Binding
 *************************************/
$(function() {

  $("#sendPoke").click(function() { sendPoke() });
  $('#feedback').hide();

  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    if (this.checkValidity()) {};

    e.preventDefault();
    console.log("Form intercept!");

    // Get data : value list of form inputs
    var formParams = $(this).serializeArray();
    userName = formParams[0].value;


    console.log(formParams);
    startGame(formParams);
  });


});