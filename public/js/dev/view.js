// Clock Test
var clockTimes = 0;
pubsub.subscribe('clock', function() {
  printFeedback("Ticktock " + clockTimes);
  clockTimes = clockTimes + 1;
});

// Transitions between state
pubsub.subscribe('newGameRequested', function() {
  $('#newGameDiv').fadeOut(300);
  $('#waitingMessage').fadeIn(600);
});

pubsub.subscribe('gameStart', function() {
  $('#waitingMessage').fadeOut(300);
  $('#debug').fadeIn(600);
  $('#debug').fadeIn(600);
  $('#chat').fadeIn(600);
});

// Debug log
function printFeedback(string) {
  $('#debug').append("<p>" + string + "</p>");
}

function printChat(string) {
  $('#chatEntries').append("<p>" + string + "</p>");
}

/* View Binding
 *************************************/
$(function() {

  $("#chatSubmit").click(function() {sentMessage();});
  $('#chat').hide();
  $("#sendPoke").click(function() { sendPoke() });
  $('#debug').hide();
  $('h2#waitingMessage').hide();

  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    // TODO: Prevent submit on safari, ios, etc
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