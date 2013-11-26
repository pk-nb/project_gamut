// Snap binds to $, so call no conflict to release jQuery globals
//jQuery.noConflict();

var socket = io.connect();
var pubsub = Pubsub.create();

// Global app parameters
var currentRoom = null;
var userName    = "";

var clockIntervalID = 0;