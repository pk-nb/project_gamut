// Data object keeping reference to board hexagons
function BoardManager(paper, numWidth, clipHeight) {
  this.paper = paper;
  this.width  = $("#paper").width();
  this.height = $("#svgContainer").height();

  this.hexagonAttributes = {
    fill: "#fff"
  };
  /* NumWidth refers to number of elements in longest row of hexagon

          0 0
         1 x 1      <- ClipHeight = 2 (number of rows to clip from top and bottom)
        2 x x 2
       3 * * * 3
        * * * *     <- numWidth = 4 (diagonal of matrix)
         * * *
          x x
           x
  */
  this.arraySideLength = numWidth;
  this.clipHeight = clipHeight;

  // Main board grouped and initally hidden
  this.hexGroup = this.paper.g();
  this.hexGroup.attr({
    opacity: 0
  });

  this.initializeBoard();

  this.pieces = [];
}

/* Private, internal methods
 **************************************/
// Returns array of {x,y} objects to clip and not draw
BoardManager.prototype.clipIndexes = function() {
  var indexes = [];
  // Calculate min/max rows to keep in between
  var low = this.clipHeight - 1;
  var high = ((2 * this.arraySideLength) - 1) - (this.clipHeight);

  // Assemble index list
  for (var i = 0; i < this.arraySideLength; i++) {
    for (var j = 0; j < this.arraySideLength; j++) {
      var addSize = i + j;
      if ( (addSize <= low) || (addSize >= high) ) {
        indexes.push( {x: i, y: j} );
      }
    }
  }
  return indexes;
}

BoardManager.prototype.drawHexagonAtPoint = function(x, y, radius) {
  var points = [];
  var angle = (Math.PI / 2);

  // Draw hexagon by using cos/sin in 6 steps
  for (var i = 0; i < 6; i++) {
    // Calculate Polyline coordinates for hexagon
    // absolute center coordinate + x/y offset
    points.push(x + ( radius * Math.cos(angle)) ); // X coordinate
    points.push(y + ( radius * Math.sin(angle)) ); // Y coordinate
    angle += (Math.PI / 3);
  }

  var hex = this.paper.polygon(points);
  // TODO: move setting attributes to drawBoard
  hex.attr(this.hexagonAttributes);
  hex.data("index", {x: x, y: y});
  return hex;
}

// Called by constructor function to layout and draw board
// Followed by drawboard to animate view in
BoardManager.prototype.initializeBoard = function() {
  this.board = [];
  // Initialize "empty" array for board
  // Clipped indexes will contain {}
  for(var i = 0; i < this.arraySideLength; i++) {
    this.board.push([]);
    for(var j = 0; j < this.arraySideLength; j++) {
      this.board[i].push({});
    }
  }

  // Scale height
  this.boardHeight = this.height * 0.87;

  // Center coordinate
  var centerX = this.width / 2;
  var centerY = this.boardHeight / 2;

  // Total number of hexagon rows, or diagonal of
  var rows = ((2 * this.arraySideLength) - 1) - (2 * (this.clipHeight));

  var splitWidth = this.width / this.arraySideLength;
  var splitHeight = this.boardHeight / rows;

  // Use smaller dimension as basic unit
  this.gridunit = (splitHeight >= splitWidth) ? splitWidth : splitHeight;
  var halfunit = this.gridunit / 2;

  // Calculate Ratio of width to height for equal spacing
  this.hexRadius = halfunit;
  var hexHeight = 2 * this.hexRadius;
  var hexWidth = 2 * Math.sqrt(( Math.pow(this.hexRadius, 2) - Math.pow((this.hexRadius/2), 2) ));
  var hexWidthToHeightRatio = hexWidth / hexHeight;

  // Hexagon spacing by ratio
  this.yUnit = this.gridunit * hexWidthToHeightRatio;

  var clipIndexes = this.clipIndexes();

  // Initialize point
  var startX = centerX - (this.gridunit * ((this.arraySideLength - 1) / 2));
  var startY = centerY;

  var topIndex = this.arraySideLength - 1;
  var rowWidth = this.arraySideLength;

  /*  Draw hexagons from center row, first hexagon, going northeast direction for each outer loop iteration
      Example Pattern:
        2 5 .
       1 4 . .
        3 . .
  */

  for (var indexX = topIndex; indexX >= 0; indexX--) {
    var tempX = startX;
    var tempY = startY;

    for (var indexY = 0; indexY <= topIndex; indexY++) {
      var index = {x: indexX, y: indexY};

      // If not a clipped off hex, draw and store reference on board and lookup table
      if ( !clipIndexes.contains(index) ) {
        var hex = this.drawHexagonAtPoint(tempX, tempY, this.hexRadius);
        hex.data("i", indexX);
        hex.data("j", indexY);
        hex.data("cx", tempX);
        hex.data("cy", tempY);
        hexesLeft.push(index);
        this.board[indexX][indexY] = hex;
        this.hexGroup.add(hex);
      }
      // Increment top right
      tempX += halfunit;
      tempY += this.yUnit;
    }
    // Go back one column
    startX += halfunit;
    startY -= this.yUnit;
  }



}

/* Public
 **************************************/
BoardManager.prototype.drawBoard = function() {
  // Update colors based on state
  // TODO: Move to updateBoard function
  // this.hexGroup.selectAll('polygon').forEach(function(el) {
  //   //console.log(el);
  //   // Assign element style for type here

  // });

  // Show board
  this.hexGroup.animate({ opacity: 1 }, 1000);

}

// Draws piece, represented by column length strings in array of
BoardManager.prototype.drawPiece = function(coordinate, pieceArray) {
  // Initialize point to draw
  var halfunit = this.gridunit / 2;

  var row = pieceArray.length;
  var column = pieceArray[0].length;

  var pointX = halfunit * (column);
  var pointY = this.yUnit;

  // Calculate coordinate (negative values subtract from height / width)
  if ( !(_.isNull(coordinate) || _.isEmpty(coordinate)) ) {
    var posx = coordinate.x + pointX;
    var negx = this.width + coordinate.x - (pointX);
    pointX = (coordinate.x < 0) ? negx : posx;

    var posy = this.yUnit + coordinate.y;
    var negy = this.height + coordinate.y - (this.yUnit * row) - (halfunit * row) ;
    pointY = (coordinate.y < 0) ? negy : posy;
  }

  // Piece in group
  var pieceGroup = this.paper.g();
  pieceGroup.attr({ opacity: 0 });

  // Draw Hex going by row, column
  for (var i = 0; i < pieceArray.length; i++) {
    var tempX = pointX;
    var tempY = pointY;

    for (var j = 0; j < pieceArray[i].length; j++) {
      if (pieceArray[i].charAt(j) === '*') {
        var hex = this.drawHexagonAtPoint(tempX, tempY, this.hexRadius);
        var color = (selfPlayerNumber === 1) ? playerOneColor : playerTwoColor;
        hex.attr({ fill: color }, 1000);
        // Store index and original center coordinate
        hex.data("i", i);
        hex.data("j", j);
        hex.data("cx", tempX);
        hex.data("cy", tempY);
        pieceGroup.add(hex);
      }
      tempX += halfunit;
      tempY += this.yUnit;
    }
    pointX -= halfunit;
    pointY += this.yUnit;
  }

  // Animate in and store center of group
  pieceGroup.animate({opacity: 1}, 1000);
  pieceGroup.data("originalCX", pieceGroup.getBBox().cx);
  pieceGroup.data("originalCY", pieceGroup.getBBox().cy);
  return pieceGroup;
}

// Returns the hexagon on the board at a given absolute x,y cooordinate
// TODO: implement more efficient search
BoardManager.prototype.hexagonAtPoint = function(x, y) {
  var boardHexs = this.hexGroup.selectAll("*");

  var returnEl = null;
  boardHexs.forEach(function(el) {
    var pointInside = Snap.path.isPointInsideBBox(el.getBBox(), x, y);
    if (pointInside) {
      returnEl = el;
    }
  });

  return returnEl;
}

// Validates
BoardManager.prototype.validPiecePlay = function(piece, overlapPieceHex, overlapBoardHex) {
  var boardManager = this;
  var coordinates = [];
  var hexes = piece.selectAll("*");

  // Find "relative" (0,0) on the board using both overlapped pieces.
  // Example (2,1) overlapped with (21, 16), so relative (0,0) on board is (19, 15)
  var baseI = overlapBoardHex.data("i") - overlapPieceHex.data("i");
  var baseJ = overlapBoardHex.data("j") - overlapPieceHex.data("j");
  var maxIndex = boardManager.board.length;

  // Check all piece-hexagon indexes for validity on board
  for (var k = 0; k < hexes.length; k++) {
    var tempI = hexes[k].data("i") + baseI;
    var tempJ = hexes[k].data("j") + baseJ;

    if ( (tempI >= maxIndex) || (tempJ >= maxIndex) ) {
      return false;
    }
    if ( _.isEmpty(boardManager.board[tempI][tempJ]) ) {
      return false;
    }

    coordinates.push({i: tempI, j: tempJ});
  }

  return coordinates;
}

// Animates in a server-validated piece from either player,
// and updates data. Stores player types on hexagon object
BoardManager.prototype.updateBoard = function(coordinates, playerNumber, pieceType) {
  var color = (playerNumber === 1) ? playerOneColor : playerTwoColor;
  var moneyColor = (playerNumber === 1) ? playerOneMoneyColor : playerTwoMoneyColor;

  for (var k = 0; k < coordinates.length; k++) {
    var hex = this.board[coordinates[k].i][coordinates[k].j];
    var animateColor = color;

    hex.data("player", playerNumber);
    hex.data("pieceType", pieceType);
    hexesLeft = _.without(hexesLeft, coordinates[k]);

    if (pieceType.money === pieceType) {
      animateColor = moneyColor;

      if (playerNumber === selfPlayerNumber) {
        selfMoneyHexList.push(hex);
      }
      else {
        opponentMoneyHexList.push(hex);
      }
    }
    hex.animate({fill: animateColor}, 500);
  }
}

BoardManager.prototype.drawPieces = function() {
  // Draw Piece background
  this.pieceBackground = this.paper.rect(0, this.boardHeight, this.width, this.height);
  this.pieceBackground.attr({
    fill: "#31B4B4",
    opacity: 0
  });

  this.pieceBackground.animate({ opacity: 1 }, 1000);

}

// Event hander for after drop. Calulates some hex in piece's coordinate and
// finds overlap on board. Then checks if entire piece can fit by indexes
function piecePlay() {
  var hex = this.select("*");

  // Offset of group-center to overlapping hex-center
  var groupHexOffsetX = this.data("originalCX") - hex.data("cx");
  var groupHexOffsetY = this.data("originalCY") - hex.data("cy");

  // Find new center of overlapping piece-hexagon
  var pointx = this.getBBox().cx - groupHexOffsetX;
  var pointy = this.getBBox().cy - groupHexOffsetY;

  var overlapHex = boardManager.hexagonAtPoint(pointx, pointy);

  // If overlaps, check if piece is valid. If so, publish, draw, etc
  if (!_.isNull(overlapHex)) {
    var pieceCoordinates = boardManager.validPiecePlay(this, hex, overlapHex);

    if ( pieceCoordinates ) {
      // Publish coordinates played to game logic
      console.log(pieceCoordinates);
      pubsub.publish("validIndexPlay", null, pieceCoordinates);
      // _.map(pieceCoordinates, function(c) {
      //   boardManager.board[c.i][c.j].animate({fill: "#bada55"}, 500);
      // });
    }
  } else {
    // TODO animate and return piece to original coordinates
  }
}




// Initializes board on page load
pubsub.subscribe('drawBoard', function(context, gameData) {
  var s = Snap("#paper");

  boardManager = new BoardManager(s, gameData.arrayLength, gameData.clipHeight);

  boardManager.drawBoard();
  boardManager.drawPieces();

  // Create pieces
  // TODO: make a drawPieces function that layouts correctly
  var piece1 = boardManager.drawPiece({}, ["-*-",
                                           "***",
                                           "-*-" ]  ).drag();

  var piece2 = boardManager.drawPiece( {x: -1, y: -1}, ["**", "**"]).drag();

  var piece3 = boardManager.drawPiece( {x: -1, y: 1}, ["---*",
                                                       "--**",
                                                       "****",
                                                       "*---"]  ).drag();

  var piece4 = boardManager.drawPiece( {x: 1, y: -1}, ["**"] ).drag();

  eve.on('snap.drag.end.' + piece1.id, piecePlay);
  eve.on('snap.drag.end.' + piece2.id, piecePlay);
  eve.on('snap.drag.end.' + piece3.id, piecePlay);
  eve.on('snap.drag.end.' + piece4.id, piecePlay);

});

pubsub.subscribe("selfUpdateBoard", function(context, indexes) {
  // TODO send type along
  boardManager.updateBoard(indexes, selfPlayerNumber, pieceTypes.normal);
});

pubsub.subscribe("opponentUpdateBoard", function(context, indexes) {
  // TODO send type along
  boardManager.updateBoard(indexes, opponentPlayerNumber, pieceTypes.normal);
});

