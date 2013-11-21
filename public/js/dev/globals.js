var socket = io.connect();
var pubsub = Pubsub.create();

// Global app parameters
var currentRoom = null;
var userName    = "";