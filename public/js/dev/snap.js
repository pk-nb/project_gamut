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
  this.adjacencyList = [];
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
        indexes.push( {i: i, j: j} );
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
  this.boardHeight = this.height * 0.8;

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
      var index = {i: indexX, j: indexY};

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

// Updates adjacencyList on piece play
BoardManager.prototype.updateAdjacentHexagons = function(coordinates) {
  // Add all adjacent hexes to list
  for (var k = 0; k < coordinates.length; k++) {
    //console.log(this.adjacentHexagons(coordinates[k]));
    this.adjacencyList = _.union( this.adjacencyList, this.adjacentHexagons(coordinates[k]) );
  }
  this.adjacencyList = intersectionObjects(hexesLeft, this.adjacencyList);
}

// Gets adjacent hexagons for given index
BoardManager.prototype.adjacentHexagons = function(index) {
  var indexes = [];
  for (var a = -1; a <= 1; a++) {
    for (var b = -1; b <= 1; b++) {

      var ix = index.i + a;
      var jy = index.j + b;

      if (a === b) { continue; }
      if ( ix < 0 || ix >= this.board.length) { continue; }
      if ( jy < 0 || jy >= this.board.length) { continue; }
      if ( this.clipIndexes().contains({i: ix, j: jy}) ) { continue; }

      indexes.push({i: ix, j: jy});
    }
  }
  return indexes;
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
BoardManager.prototype.drawPiece = function(coordinate, pieceArray, piece) {
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

  // Accomodate for hex width
  pointX -= (this.hexRadius / 2);
  pointY -= (this.hexRadius / 2);

  // Calculate piece color
  var color = (selfPlayerNumber === 1) ? playerOneColor : playerTwoColor;
  if (piece.type === pieceTypes.money) {
    color = (selfPlayerNumber === 1) ? playerOneMoneyColor : playerTwoMoneyColor;
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

    if (pieceTypes.money === pieceType) {
      animateColor = moneyColor;

      if (playerNumber === selfPlayerNumber) {
        hex.data("moneyCounter", 0);
        selfMoneyHexList.push(hex);
      }
      else {
        opponentMoneyHexList.push(hex);
      }
    }
    hex.animate({fill: animateColor}, 500);
  }

  hexesLeft = _.without(hexesLeft, coordinates);
  if (playerNumber === selfPlayerNumber) {
    this.updateAdjacentHexagons(coordinates);
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

  // Get pieces loop
  var splitWidth = this.width / boardPieces.length;
  var height = this.height - this.boardHeight;


  for (var i = 0; i < boardPieces.length; i++) {
    var piece = this.drawPiece({}, boardPieces[i].shape, boardPieces[i]);

    var centerX = (splitWidth / 2) + (splitWidth * i);
    var centerY = this.boardHeight + (height / 2);

    centerX -= (piece.getBBox().width / 2);
    centerY -= (piece.getBBox().height / 2) + 20;

    // Draw label
    var cost = this.paper.text(centerX, this.height - 15, "\u2B21" + boardPieces[i].cost);
    cost.attr({
      fill: "#EEE"
    });

    // Ugly hack to offset odd pieces
    // TODO: rewrite drawPiece and drawPieces to have nice centering
    if (i === 3) { centerY -= (piece.getBBox().height / 2); }
    if (i === 5) {
      centerX -= (piece.getBBox().width / 3);
      centerY -= (piece.getBBox().height / 4);
    }

    // TODO: cleanup, no need to store same data
    piece.data("cost", boardPieces[i].cost);
    piece.data("type", boardPieces[i].type);
    piece.data("piece", boardPieces[i]);

    var transformString = "t" + centerX + "," + centerY;
    piece.data("originalTransform", transformString);
    piece.data("originalX", centerX);
    piece.data("originalY", centerY);

    piece.transform( transformString );
    piece.drag();
    eve.on('snap.drag.end.' + piece.id, piecePlay);

    this.pieces.push(piece);
  }
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
      //console.log(pieceCoordinates);
      pubsub.publish("validIndexPlay", null, pieceCoordinates, this);
    }
  } else {
    // TODO animate and return piece to original coordinates
    // this.animate({
    //     translate: this.data("originalTransform")
    //   }, 1000);
  }

  this.animate({opacity:0}, 200, mina.linear, function() {
    this.transform(this.data("originalTransform"));
    this.animate({opacity:1}, 1000);
  });

}


// Initializes board on page load
pubsub.subscribe('drawBoard', function(context, gameData) {
  var s = Snap("#paper");

  boardManager = new BoardManager(s, gameData.arrayLength, gameData.clipHeight);

  boardManager.drawBoard();
  boardManager.drawPieces();

  // Draw Start Pieces
  boardManager.updateBoard( [ gameData.startIndexes[selfPlayerNumber]], selfPlayerNumber, pieceTypes.money);
  boardManager.updateBoard( [ gameData.startIndexes[opponentPlayerNumber]], opponentPlayerNumber, pieceTypes.money);

  // Initially set pieces to disabled
  pubsub.publish("moneyUpdate");

  // boardManager.adjacentHexagons({i: 5, j: 2});
  // boardManager.adjacentHexagons({i: 0, j: 1});
  // boardManager.adjacentHexagons({i: 10, j: 17});
  // boardManager.adjacentHexagons({i: 0, j: 18});


  // Create pieces
  // TODO: make a drawPieces function that layouts correctly
  // var piece1 = boardManager.drawPiece({}, ["-*-",
  //                                          "***",
  //                                          "-*-" ]  ).drag();

  // var piece2 = boardManager.drawPiece( {x: -1, y: -1}, ["**", "**"]).drag();

  // var piece3 = boardManager.drawPiece( {x: -1, y: 1}, ["---*",
  //                                                      "--**",
  //                                                      "****",
  //                                                      "*---"]  ).drag();

  // var piece4 = boardManager.drawPiece( {x: 1, y: -1}, ["**"] ).drag();

  // eve.on('snap.drag.end.' + piece1.id, piecePlay);
  // eve.on('snap.drag.end.' + piece2.id, piecePlay);
  // eve.on('snap.drag.end.' + piece3.id, piecePlay);
  // eve.on('snap.drag.end.' + piece4.id, piecePlay);

});

pubsub.subscribe("selfUpdateBoard", function(context, indexes, piece) {
  // TODO send type along
  console.log(piece);
  boardManager.updateBoard(indexes, selfPlayerNumber, piece.type);
});

pubsub.subscribe("opponentUpdateBoard", function(context, indexes, piece) {
  // TODO send type along
  boardManager.updateBoard(indexes, opponentPlayerNumber, piece.type);
});

pubsub.subscribe("moneyViewUpdate", function(context, hex) {

  hex.animate({fill: "#9aba33"}, 400, mina.linear, function() {
    var color = (hex.data("player") === 1 ) ? playerOneMoneyColor : playerTwoMoneyColor;
    this.animate({fill: color}, 400);
  });

});

pubsub.subscribe("opponentMoneyViewUpdate", function(context, hexIndex) {
  var hex = boardManager.board[hexIndex.i][hexIndex.j];
  hex.animate({fill: "#9aba33"}, 400, mina.linear, function() {
    var color = (hex.data("player") === 1 ) ? playerOneMoneyColor : playerTwoMoneyColor;
    this.animate({fill: color}, 400);
  });
});

pubsub.subscribe("moneyUpdate", function() {
  var grey = "#999";
  var color;

  for (var i = 0; i < boardManager.pieces.length; i++) {
    var piece = boardManager.pieces[i];
    if ( money >= piece.data("cost") ) {

      // If piece not already enabled, reenable
      if ( !piece.data("enabled") ) {
        if (piece.data("type") === pieceTypes.money) {
          color = ( selfPlayerNumber === 1 ) ? playerOneMoneyColor : playerTwoMoneyColor;
        }
        else {
          color = ( selfPlayerNumber === 1 ) ? playerOneColor : playerTwoColor;
        }

        piece.selectAll("*").forEach(function(el) {
          el.animate({fill: color}, 300);
        });
        piece.drag()
        eve.on('snap.drag.end.' + piece.id, piecePlay);
        piece.data("enabled", true);
      }
    }
    else {
      piece.selectAll("*").forEach(function(el) {
        el.animate({fill: grey}, 300);
      });
      piece.undrag();
      piece.data("enabled", false);
    }
  }
});



