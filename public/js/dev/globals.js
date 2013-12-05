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

var timer = 0;
var gameOn = false;

var playerOneColor = "#FA475C";
var playerTwoColor = "#FFC749";

var playerOneMoneyColor = "#C7283B";
var playerTwoMoneyColor = "#CB9929";

// Game Logic Data
var hexesLeft = [];
var selfMoneyHexList = [];
var opponentMoneyHexList = [];

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

