var socket = io.connect();



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

// GETTING message Display message on client-recieve
socket.on('gameStart', function(data) {
  console.log(data);
  printFeedback(data.self + " VS " + data.opponent);
});


/* View Binding
 *************************************/
$(function() {

  $('#feedback').hide();

  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    if (this.checkValidity()) {};

    e.preventDefault();
    console.log("Form intercept!");

    // Get data : value list of form inputs
    var formParams = $(this).serializeArray();
    console.log(formParams);
    startGame(formParams);
  });


});