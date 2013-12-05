// Clock
var clock = function() {
  console.log('ticktock');
  pubsub.publish('clock');
}

pubsub.subscribe('gameStart', function(context, data) {
  // Set clock and reference to stop
  clockIntervalID = window.setInterval(clock, 1000);
  selfPlayerNumber = data.player;
  opponentPlayerNumber = (selfPlayerNumber === 1) ? 2 : 1;
  currentRoom = data.room;  // Save room, currently not being used
  gameOn = true;            // When game start set to true, timer starts
});

pubsub.subscribe('validIndexPlay', function(context, indexes, piece) {

  var adjacent = false;

  // Validiate move by game board
  // Check if next to correct color,
  // Not overlapping another color, etc




  pubsub.publish('validPlay', null, indexes, piece);

});

// Hexagon model
var hexagon = {
  type: "",
  owner: "",
  origin: {}
}


