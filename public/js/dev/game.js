// Clock
var clock = function() {
  console.log('ticktock');
  pubsub.publish('clock');
}

pubsub.subscribe('gameStart', function() {
  // Set clock and reference to stop
  clockIntervalID = window.setInterval(clock, 1000);
});

pubsub.subscribe('validIndexPlay', function(context, indexes) {

  // Validiate move by game board
  // Check if next to correct color,
  // Not overlapping another color, etc

  pubsub.publish('validPlay', null, indexes);

});

// Hexagon model
var hexagon = {
  type: "",
  owner: "",
  origin: {}
}


