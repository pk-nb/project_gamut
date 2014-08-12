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

pubsub.subscribe('gameStart', function(context, data) {
  $('#waiting').fadeOut(300);
  $('#game').show();
  //console.log(data);
  pubsub.publish('drawBoard', null, data.gameData);
  if (data.player === 1) {
    $('#players').html("<span class='one'>" + data.self + "</span> VS <span class='two'>" + data.opponent + "</span>");
  } else {
    $('#players').html("<span class='two'>" + data.self + "</span> VS <span class='one'>" + data.opponent + "</span>");
  }

  //$('#debug').fadeIn(600);
  //$('#chat').fadeIn(600);
});


pubsub.subscribe("moneyUpdate", function() {
  $("#moneyField").html("\u2B21" + money);
  // $("#moneyField").fadeOut("fast").html("");
  // $("#moneyField").fadeIn("fast").html("\u2B21" + money);
});


// Debug log
function printFeedback(string) {
  $('#debug').append("<p>" + string + "</p>");
}

function printChat(string) {
  $('#chatEntries').append("<p>" + string + "</p>");
}

// timer debug
function printTimer(string) {
  $('#counter').html(timer);
}


/* View Binding
 *************************************/
jQuery( document ).ready(function( $ ) {

  $("#chatSubmit").click(function() {sentMessage();});
  //$('#chat').hide();
  $("#sendPoke").click(function() { sendPoke(); });
  $('h2#waitingMessage').hide();
  $('#game').hide();

  // Debug stuff
  $('#debug').hide();
  //$('#newGameDiv').hide();


  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    // TODO: Prevent submit on safari, ios, etc
    if (this.checkValidity()) {}

    e.preventDefault();
    console.log("Form intercept!");

    // Get data : value list of form inputs
    var formParams = $(this).serializeArray();
    userName = formParams[0].value;


    console.log(formParams);
    startGame(formParams);
  });

  // Use chat library
  $('#chatLink').sidr({
    side: 'right'
  });

});