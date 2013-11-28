// Data object keeping reference to board hexagons
function BoardManager(paper, numWidth, clipHeight) {
  this.paper = paper;
  this.hexagonAttributes = {
    fill: "#fff"
    //stroke: "#000",
    //strokeWidth: 1
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

  // Initialize Board
  this.board = [];
  // Double Array of board refering to above image
  for(var i = 0; i < numWidth; i++) {
    this.board.push([]);
    for(var j = 0; j < numWidth; j++) {
      this.board[i].push({});
    }
  }
}

/* Private, internal methods
 **************************************/
BoardManager.prototype.initializeBoard = function() {
  //$("#")
}


// Returns array of {x,y} objects to clip and not draw
BoardManager.prototype.clipIndexes = function() {
  var indexes = [];
  var low = this.clipHeight;
  var high = this.arraySideLength + this.clipHeight - 1;

  console.log("low: " + low + ", high: " + high);

  for (var i = 0; i < this.arraySideLength; i++) {
    for (var j = 0; j < this.arraySideLength; j++) {
      var addSize = i + j;
      if ( (addSize <= low) || (addSize >= high) ) {
        indexes.push( [i, j] );
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
  return hex;
}

BoardManager.prototype.setHexagonAttributes = function(attr) {
  this.hexagonAttributes = attr;
}

BoardManager.prototype.adjacentIndexes = function(x, y) {

}

// Public
BoardManager.prototype.drawBoard = function() {
  var width  = $("#paper").innerWidth();
  var height = $("#paper").innerHeight();

  console.log("width: " + width + ", height: " + height);

  // Center coordinate
  var centerX = width / 2;
  var centerY = height / 2;

  var rows = ((2 * this.arraySideLength) - 1) - (2 * (this.clipHeight + 1));

  var splitWidth = width / this.arraySideLength;
  var splitHeight = height / rows;

  console.log("splitWidth: " + splitWidth + ", splitHeight: " + splitHeight);

  // Use smaller dimension as basic unit
  var gridunit = (splitHeight >= splitWidth) ? splitWidth : splitHeight;
  var halfunit = gridunit / 2;

  var hexRadius = gridunit / 2;

  var clipIndexes = this.clipIndexes();
  console.log(clipIndexes);
  // Initialize point
  var startX = centerX - (gridunit * ((this.arraySideLength - 1) / 2));
  var startY = centerY;

  var indexX = this.arraySideLength - 1;
  var indexY = 0;
  var rowWidth = this.arraySideLength;

  while (indexY < rowWidth) {
    this.board[indexX][indexY] = this.drawHexagonAtPoint(startX, startY, hexRadius);
    console.log("board[" + indexX + "][" + indexY + "] = (" + startX + ", " + startY + ")" );
    console.log("radius: " + hexRadius);
    startX += gridunit;
    indexX -= 1;
    indexY += 1;
  };

  // for (indexX; indexX >= 0; indexX--) {
  //   var tempX = startX;
  //   var tempY = startY;

  //   for (indexY; indexY < this.arraySideLength; indexY++) {

  //     if (!_.contains(clipIndexes, [indexX, indexY])) {
  //       this.board[indexX][indexY] = this.drawHexagonAtPoint(startX, startY, hexRadius);
  //     }
  //     tempX += gridunit;
  //     tempY += gridunit;

  //   };

  //   startX -= gridunit;
  //   startY += gridunit;
  // };
}


$(document).ready(function(){
  var s = Snap("#paper");
  // var hex = s.polygon(10, 10, 100, 100, 70, 30);
  // hex.attr({
  //   fill: "#bada55",
  //   stroke: "#000",
  //   strokeWidth: 3
  // });

  var boardManager = new BoardManager(s, 5, 2);
  //boardManager.drawHexagonAtPoint(20, 20, 20);
  boardManager.drawBoard();

  // var points = [];
  // var x = 200;
  // var y = 90;
  // var radius = 30;
  // // Get the points
  // for (var i = 0; i < 6; i++) {
  //   points.push(x + ( radius * Math.cos( (Math.PI * i) / 3) ) ); // X coordinate
  //   points.push(y + ( radius * Math.sin( (Math.PI * i) / 3) ) ); // Y coordinate
  // }

  // console.log(points);
  // var h = s.polygon(points);
  // h.attr(this.hexagonAttributes);

  // h.attr({
  //   fill: "#ffffff",
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
