exports.users = [];

// Construcutor object for queues
exports.Queues = function() {
  this.small   = [];
  this.medium  = [];
  this.large   = [];
}

exports.types = {
    sizes : {
      small  : { id : 'small',  size : 20, description : "Small Board (20x20)" },
      medium : { id : 'medium', size : 30, description : "Medium Board (30x30)" },
      large  : { id : 'large',  size : 50, description : "Large Board (50x50)" }
  }
}

exports.timer = 0.5;