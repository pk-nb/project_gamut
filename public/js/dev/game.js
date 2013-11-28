// Clock
var clock = function() {
  console.log('ticktock');
  pubsub.publish('clock');
}

pubsub.subscribe('gameStart', function() {
  // Set clock and reference to stop
  clockIntervalID = window.setInterval(clock, 1000);
});

// Hexagon model
var hexagon = {
  type: "",
  owner: "",
  origin: {}
}