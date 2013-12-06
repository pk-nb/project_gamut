// Clock
var clock = function() {
  //console.log('ticktock');
  pubsub.publish('clock');
}

pubsub.subscribe("serverClock", function() {
  for (var i = 0; i < selfMoneyHexList.length; i++) {
    var hex = selfMoneyHexList[i];
    // Increment money counter
    hex.data("moneyCounter", (hex.data("moneyCounter") + 1));
    //console.log("moneyCounter: " + hex.data("moneyCounter"))
    if (hex.data("moneyCounter") === moneyClockCycles) {
      // Send money add message
      pubsub.publish("moneyIncrement", null, hex);
      hex.data("moneyCounter", 0);
    }
  }
});

pubsub.subscribe("moneyIncrement", function(context, hex) {
  //console.log("moneyIncrement");
  money++;
  pubsub.publish("moneyViewUpdate", null, hex);
  pubsub.publish("moneyUpdate");
});

pubsub.subscribe("moneyDecrement", function(context, hex) {

});


pubsub.subscribe('gameStart', function(context, data) {
  // Set clock and reference to stop
  clockIntervalID = window.setInterval(clock, 1000);
  selfPlayerNumber = data.player;
  opponentPlayerNumber = (selfPlayerNumber === 1) ? 2 : 1;
  currentRoom = data.room;  // Save room, currently not being used
  gameOn = true;            // When game start set to true, timer starts
});

pubsub.subscribe('validIndexPlay', function(context, indexes, piece) {

  // Validate Play (if adjacent piece)
  var adjacent = false;
  for (var k = 0; k < indexes.length; k++) {
    if (boardManager.adjacencyList.contains( indexes[k] )) {
      adjacent = true;
      break;
    }
  }

  if (adjacent) {
    // subtract $$
    // console.log("piece cost: " + piece.data("cost"));
    // money -= piece.data("cost");
    // pubsub.publish("moneyUpdate");
    pubsub.publish('validPlay', null, indexes, piece.data("piece"));
  }
  else {
    pubsub.publish('invalidPlay');
  }
});

pubsub.subscribe("selfUpdateBoard", function(context, indexes, piece) {
  money -= piece.cost;
  pubsub.publish("moneyUpdate");
})

// Hexagon model
var hexagon = {
  type: "",
  owner: "",
  origin: {}
}


