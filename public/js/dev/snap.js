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
  this.board = [];
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

  // Set Array of board
  for(var i = 0; i < this.arraySideLength; i++) {
    this.board.push([]);
    for(var j = 0; j < this.arraySideLength; j++) {
      this.board[i].push({});
    }
  }

  var width  = $("#paper").innerWidth();
  var height = $("#paper").innerHeight();

  console.log("width: " + width + ", height: " + height);

  // Center coordinate
  var centerX = width / 2;
  var centerY = height / 2;

  var rows = ((2 * this.arraySideLength) - 1) - (2 * (this.clipHeight));

  var splitWidth = width / this.arraySideLength;
  var splitHeight = height / rows;

  console.log("splitWidth: " + splitWidth + ", splitHeight: " + splitHeight);

  // Use smaller dimension as basic unit
  this.gridunit = (splitHeight >= splitWidth) ? splitWidth : splitHeight;
  var halfunit = this.gridunit / 2;

  // Calculate Ratio of width to height for equal spacing
  this.hexRadius = halfunit;
  var hexHeight = 2 * this.hexRadius;
  var hexWidth = 2 * Math.sqrt(( Math.pow(this.hexRadius, 2) - Math.pow((this.hexRadius/2), 2) ));
  var hexWidthToHeightRatio = hexWidth / hexHeight;

  this.yUnit = this.gridunit * hexWidthToHeightRatio;

  console.log("hexHeight: " + hexHeight + ", hexWidth: " + hexWidth + ", Ratio: " + hexWidthToHeightRatio);


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
        //hex.data("index", index);
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

   console.log(this.board);
   console.log(hexIdToIndex);
   console.log(this.hexGroup);
}

BoardManager.prototype.drawBoard = function() {
  this.hexGroup.selectAll('polygon').forEach(function(el) {
    //console.log(el);
    // Assign element style for type here

  });

  // Show board
  this.hexGroup.animate({ opacity: 1 }, 1000);
}

BoardManager.prototype.drawPiece = function(row, column, pieceString) {
  // Initialize point to draw
  var halfunit = this.gridunit / 2;

  var pointX = halfunit * (column);
  var pointY = this.yUnit;

  console.log(this.gridunit);
  console.log(this.yUnit);
  var pieceGroup = this.paper.g();

  for (var i = 0; i < row; i++) {
    var tempX = pointX;
    var tempY = pointY;

    for (var j = 0; j < column; j++) {
      if (pieceString[i].charAt(j) === '*') {
        var hex = this.drawHexagonAtPoint(tempX, tempY, this.hexRadius);
        hex.attr({ fill: "#911", opacity: 0.7 });
        pieceGroup.add(hex);

        console.log("tempX: " + tempX + ", tempY: " + tempY);
      }

      tempX += halfunit;
      tempY += this.yUnit;
    }

    pointX -= halfunit;
    pointY += this.yUnit;
  }

  return pieceGroup;
}



$(document).ready(function(){
  var s = Snap("#paper");

  var boardManager = new BoardManager(s, 13, 5);
  //boardManager.drawHexagonAtPoint(20, 20, 20);
  //boardManager.initializeBoard();

  boardManager.drawBoard();

  boardManager.drawPiece(3, 3, ["-*-",
                                "***",
                                "-*-"]  ).drag();

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
