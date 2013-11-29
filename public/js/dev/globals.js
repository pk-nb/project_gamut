var socket = io.connect();
var pubsub = Pubsub.create();

// Global app parameters
var currentRoom = null;
var userName    = "";

var clockIntervalID = 0;

var timer = 0;

var gameOn = false;