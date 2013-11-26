var drawHexagonAtPoint = function (paper, x, y, radius, attr) {

};


$(document).ready(function(){
  var s = Snap("#paper");
  //var bigCircle = s.circle(150, 150, 100);
  var hex = s.polygon(10, 10, 100, 100, 70, 30);
  hex.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 3
  });

  hex.drag();

  hex.mousedown(function(){
    this.attr({fill: "#911"});
  });

  hex.mouseover(function(){
    this.attr({fill: "#911"});
  });

  hex.mouseout(function(){
    this.attr({fill: "#bada55"});
  });
});
