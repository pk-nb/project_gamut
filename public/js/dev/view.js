function printFeedback(string) {
  $('#debug').append("<p>" + string + "</p>");
}

function printChat(string) {
  $('#chatEntries').append("<p>" + string + "</p>");
}

var clockTimes = 0;
pubsub.subscribe('clock', function() {
  printFeedback("Ticktock " + clockTimes);
  clockTimes = clockTimes + 1;
});


pubsub.subscribe('newGameRequested', function() {
  $('#newGameDiv').hide();
  $('#debug').show();
  $('#chat').show();
});

/* View Binding
 *************************************/
$(function() {

  $("#chatSubmit").click(function() {sentMessage();});
  $('#chat').hide();
  $("#sendPoke").click(function() { sendPoke() });
  $('#debug').hide();

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