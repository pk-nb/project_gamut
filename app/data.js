module.exports = {

  // Using javascript file as temp. data storage for now

  users: [],

  // Make a queue of sockets that have not been connected yet
  smallQueue:   [],
  mediumQueue:  [],
  largeQueue:   [],

  sizes : {
    small  : { id : 'small',  size : 20, description : "Small Board (20x20)" },
    medium : { id : 'medium', size : 30, description : "Medium Board (30x30)" },
    large  : { id : 'large',  size : 50, description : "Large Board (50x50)" }
  }

}