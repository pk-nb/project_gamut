// Data object keeping reference to board hexagons
function BoardManager(paper, numWidth, clipHeight) {
  this.paper = paper;
  this.hexagonAttributes = {
    fill: "#fff"
  };
  /* NumWidth refers to number of elements in longest row of hexagon

          0 0
         1 x 1      <- ClipHeight = 2 ()
        2 x x 2
       3 * * * 3
        * * * *     <- numWidth = 4 (diagonal of matrix)
         * * *
          x x
           x
  */
  this.arraySideLength = numWidth;
  this.clipHeight = clipHeight;
  //this.rows = ((2 * this.arraySideLength) - 1) - (2 * (this.clipHeight));


  // Initialize Board
  ///this.board = [];
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
  var low = this.clipHeight - 1;
  var high = ((2 * this.arraySideLength) - 1) - (this.clipHeight);

  // console.log("low: " + low + ", high: " + high);

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

  for (var i = 0; i < 6; i++) {
    // Calculate Polyline coordinates for hexagon
    // absolute center coordinate + x/y offset
    points.push(x + ( radius * Math.cos(angle)) ); // X coordinate
    points.push(y + ( radius * Math.sin(angle)) ); // Y coordinate
    angle += (Math.PI / 3);
  }

  var hex = this.paper.polygon(points);
  hex.attr(this.hexagonAttributes);
  hex.data("index", {x: x, y: y});
  return hex;
}

BoardManager.prototype.setHexagonAttributes = function(attr) {
  this.hexagonAttributes = attr;
}

BoardManager.prototype.adjacentIndexes = function(x, y) {

}

// Public
BoardManager.prototype.initializeBoard = function() {
  this.board = [];
  // Set Array of board
  for(var i = 0; i < this.arraySideLength; i++) {
    this.board.push([]);
    for(var j = 0; j < this.arraySideLength; j++) {
      this.board[i].push({});
    }
  }

  this.width  = $("#paper").innerWidth();
  this.height = $("#paper").innerHeight();

  //console.log("width: " + this.width + ", height: " + this.height);

  // Center coordinate
  var centerX = this.width / 2;
  var centerY = this.height / 2;

  var rows = ((2 * this.arraySideLength) - 1) - (2 * (this.clipHeight));

  var splitWidth = this.width / this.arraySideLength;
  var splitHeight = this.height / rows;

  //console.log("splitWidth: " + splitWidth + ", splitHeight: " + splitHeight);

  // Use smaller dimension as basic unit
  this.gridunit = (splitHeight >= splitWidth) ? splitWidth : splitHeight;
  var halfunit = this.gridunit / 2;

  // Calculate Ratio of width to height for equal spacing
  this.hexRadius = halfunit;
  var hexHeight = 2 * this.hexRadius;
  var hexWidth = 2 * Math.sqrt(( Math.pow(this.hexRadius, 2) - Math.pow((this.hexRadius/2), 2) ));
  var hexWidthToHeightRatio = hexWidth / hexHeight;

  this.yUnit = this.gridunit * hexWidthToHeightRatio;

  //console.log("hexHeight: " + hexHeight + ", hexWidth: " + hexWidth + ", Ratio: " + hexWidthToHeightRatio);


  var clipIndexes = this.clipIndexes();

  // Initialize point
  var startX = centerX - (this.gridunit * ((this.arraySideLength - 1) / 2));
  var startY = centerY;

  var topIndex = this.arraySideLength - 1;
  var rowWidth = this.arraySideLength;

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
        this.board[indexX][indexY] = hex;
        hexIdToIndex[hex.id] = index;
        this.hexGroup.add(hex);
      }
      // Increment top right
      tempX += halfunit;
      tempY += this.yUnit;
    }

    // Start from
    startX += halfunit;
    startY -= this.yUnit;
  }

   // console.log(this.board);
   // console.log(hexIdToIndex);
   // console.log(this.hexGroup);
}

BoardManager.prototype.drawBoard = function() {
  this.hexGroup.selectAll('polygon').forEach(function(el) {
    //console.log(el);
    // Assign element style for type here

  });

  // Show board
  this.hexGroup.animate({ opacity: 1 }, 1000);
}

BoardManager.prototype.drawPiece = function(coordinate, row, column, pieceString) {
  // Initialize point to draw
  var halfunit = this.gridunit / 2;

  var pointX = halfunit * (column);
  var pointY = this.yUnit;

  if ( !(_.isNull(coordinate) || _.isEmpty(coordinate)) ) {
    var posx = coordinate.x + halfunit * (column);
    var negx = this.width + coordinate.x - (halfunit * (column));
    pointX = (coordinate.x < 0) ? negx : posx;

    var posy = this.yUnit + coordinate.y;
    var negy = this.height + coordinate.y - (this.yUnit * row) - (halfunit * row) ;
    pointY = (coordinate.y < 0) ? negy : posy;
  }

  // console.log(this.gridunit);
  // console.log(this.yUnit);
  var pieceGroup = this.paper.g();
  pieceGroup.attr({ opacity: 0 });
  for (var i = 0; i < row; i++) {
    var tempX = pointX;
    var tempY = pointY;

    for (var j = 0; j < column; j++) {
      if (pieceString[i].charAt(j) === '*') {
        var hex = this.drawHexagonAtPoint(tempX, tempY, this.hexRadius);
        hex.attr({ fill: "#fa475c" }, 1000);
        hex.data("i", i);
        hex.data("j", j);
        hex.data("cx", tempX);
        hex.data("cy", tempY);
        pieceGroup.add(hex);

        //console.log("tempX: " + tempX + ", tempY: " + tempY);
      }

      tempX += halfunit;
      tempY += this.yUnit;
    }

    pointX -= halfunit;
    pointY += this.yUnit;
  }

  pieceGroup.animate({opacity: 1}, 1000);
  pieceGroup.data("originalCX", pieceGroup.getBBox().cx);
  pieceGroup.data("originalCY", pieceGroup.getBBox().cy);
  return pieceGroup;
}

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

BoardManager.prototype.validPiecePlay = function(piece, i, j) {
  var boardManager = this;
  var coordinates = [];
  var valid = true;
  var hexes = piece.selectAll("*");

  for (var k = 0; k < hexes.length; k++) {
    var tempI = hexes[k].data("i") + i;
    var tempJ = hexes[k].data("j") + j - 1;

    var maxIndex = boardManager.board.length;

    if ( (tempI >= maxIndex) || (tempJ >= maxIndex) ) {
      valid = false;
      return false;
    }
    if ( _.isEmpty(boardManager.board[tempI][tempJ]) ) {
      valid = false;
      return false;
    }

    coordinates.push({i: tempI, j: tempJ});
  }

  return coordinates;
}



$(document).ready(function(){
  var s = Snap("#paper");

  var boardManager = new BoardManager(s, 30, 17);

  //boardManager.initializeBoard();

  boardManager.drawBoard();

  var piece1 = boardManager.drawPiece({}, 3, 3, ["-*-",
                                    "***",
                                    "-*-" ]  ).drag();


  // var moveFunc = function (dx, dy, posx, posy) {
  //   this.attr( { cx: posx , cy: posy } ); // basic drag, you would want to adjust to take care of where you grab etc.
  //   console.log(this);
  // };

  // piece1.drag(moveFunc,
  //   function() {
  //     console.log("Move started");
  //   },
  //   function() {
  //     console.log(this.getBBox());
  //   }
  // );

  // eve.on('snap.drag.over.' + piece1.id)



  eve.on('snap.drag.end.' + piece1.id, function() {
    //console.log(piece1.selectAll("*"));
    var hex = this.select("*");
    //hex.animate({fill: "#000"}, 500);

    //console.log(this.getBBox());
    var groupHexOffsetX = this.data("originalCX") - hex.data("cx");
    var groupHexOffsetY = this.data("originalCY") - hex.data("cy");

    var pointx = this.getBBox().cx - groupHexOffsetX;
    var pointy = this.getBBox().cy - groupHexOffsetY;

    //console.log(pointx, pointy);
    var overlapHex = boardManager.hexagonAtPoint(pointx, pointy);
    //console.log(overlapHex)
    if (!_.isNull(overlapHex)) {
      //overlapHex.animate({fill: "#bada55"}, 500);

      var pieceCoordinates = boardManager.validPiecePlay(this, overlapHex.data("i"), overlapHex.data("j"));

      //console.log(pieceCoordinates);
      if ( pieceCoordinates ) {
        // Publish coordinates played to game logic
        _.map(pieceCoordinates, function(c) {
          boardManager.board[c.i][c.j].animate({fill: "#bada55"}, 500);
        });
      }
    }

  });


  // var hex = boardManager.drawHexagonAtPoint(20, 20, 20);
  // hex.drag();

  // eve.on('snap.drag.end.' + hex.id, function() {
  //   //piece1._bboxwt = undefined; // HACK to update BBox
  //   console.log(this.getBBox());
  //   //this._bboxwt = undefined; // HACK to update BBox
  // });


  boardManager.drawPiece( {x: -1, y: -1}, 2, 2, ["**", "**"]).drag();

  boardManager.drawPiece( {x: -1, y: 1}, 4, 4, ["---*",
                                                "--**",
                                                "**--",
                                                "*---"]  ).drag();

  boardManager.drawPiece( {x: 1, y: -1}, 1, 2, ["**"] ).drag();

  //console.log(boardManager.board[2][8].data("index"));

  // boardManager.hexGroup.attr({
  //   fill: "#911"
  // });

  // boardManager.hexGroup.mouseover(function(){
  //   this.attr({fill: "#bad555"}, 300);
  // });

  // boardManager.hexGroup.mouseout(function(){
  //   this.animate({fill: "#fff"}, 300);
  // });

  // var hex = s.polygon(10, 10, 100, 100, 70, 30);
  // hex.attr({
  //   fill: "#bada55",
  //   stroke: "#000",
  //   strokeWidth: 3
  // });

  // hex.drag();

  // hex.mousedown(function(){
  //   this.attr({fill: "#911"});
  // });

  // hex.mouseover(function(){
  //   this.attr({fill: "#911"});
  // });

  // hex.mouseout(function(){
  //   this.attr({fill: "#bada55"});
  // });
});
