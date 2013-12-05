// Snap binds to $, so call no conflict to release jQuery globals
//jQuery.noConflict();

var socket = io.connect();
var pubsub = Pubsub.create();

// Presenter object with hexagon board storage
var BoardManager;

// Global app parameters
var currentRoom = null;
var userName    = "";

var clockIntervalID = 0;

var timer = 0;

var gameOn = false;

var hexIdToIndex = {};

var playerOneColor = "#FA475C";
var playerTwoColor = "#FFC749";

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

