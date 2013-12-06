// Snap binds to $, so call no conflict to release jQuery globals
//jQuery.noConflict();

var socket = io.connect();
var pubsub = Pubsub.create();

// Presenter object with hexagon board storage
var BoardManager;

// Global app parameters
var currentRoom = null;
var userName    = "";
var selfPlayerNumber;
var opponentPlayerNumber;

var clockIntervalID = 0;

//var timer = 0;
var gameOn = false;

var playerOneColor = "#FA475C";
var playerTwoColor = "#FFC749";

var playerOneMoneyColor = "#FEBDC4";
var playerTwoMoneyColor = "#FFDB8A";

// Game Logic Data
var hexesLeft = [];
var selfMoneyHexList = [];
var opponentMoneyHexList = [];
var money = 0;

// Constant
var moneyClockCycles = 6;

var pieceTypes = {
  normal: 0,
  money: 1
};

var boardPieces = [
  {
    type: pieceTypes.money,
    cost: 2,
    shape: ["*"]
  },
  {
    type: pieceTypes.normal,
    cost: 2,
    shape: ["**"]
  },
  {
    type: pieceTypes.normal,
    cost: 2,
    shape: ["*-", "*-"]
  },
  {
    type: pieceTypes.normal,
    cost: 3,
    shape: ["-*", "**"]
  },
  {
    type: pieceTypes.normal,
    cost: 3,
    shape: ["**", "*-"]
  },
  {
    type: pieceTypes.normal,
    cost: 5,
    shape: ["-*-", "***", "-*-"]
  },
  // {
  //   type: pieceTypes.normal,
  //   cost: 5,
  //   shape: ["*---", "-*--", "--*-", "---*"]
  // },
  {
    type: pieceTypes.money,
    cost: 7,
    shape: ["**", "**"]
  }
];


/**
 * Array.prototype.[method name] allows you to define/overwrite an objects method
 * needle is the item you are searching for
 * this is a special variable that refers to "this" instance of an Array.
 * returns true if needle is in the array, and false otherwise
 */
Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (_.isEqual(this[i], needle)) return true;
   }
   return false;
}


// Replacement for underscore's intersection
// taken from http://stackoverflow.com/questions/8672383/how-to-use-underscores-intersection-on-objects?rq=1
function intersectionObjects2(a, b, areEqualFunction) {
    var Result = [];

    for(var i = 0; i < a.length; i++) {
        var aElement = a[i];
        var existsInB = _.any(b, function(bElement) { return areEqualFunction(bElement, aElement); });
        if(existsInB) {
            Result.push(aElement);
        }
    }

    return Result;
}

function intersectionObjects() {
    var Results = arguments[0];
    var LastArgument = arguments[arguments.length - 1];
    var ArrayCount = arguments.length;
    var areEqualFunction = _.isEqual;

    if(typeof LastArgument === "function") {
        areEqualFunction = LastArgument;
        ArrayCount--;
    }

    for(var i = 1; i < ArrayCount ; i++) {
        var array = arguments[i];
        Results = intersectionObjects2(Results, array, areEqualFunction);
        if(Results.length === 0) break;
    }
    return Results;
}

