// Snap binds to $, so call no conflict to release jQuery globals
//jQuery.noConflict();

var socket = io.connect();
var pubsub = Pubsub.create();

// Global app parameters
var currentRoom = null;
var userName    = "";

var clockIntervalID = 0;

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