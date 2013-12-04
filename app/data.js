exports.users = [];

// Construcutor object for queues
exports.Queues = function() {
  this.small   = [];
  this.medium  = [];
  this.large   = [];
}

exports.types = {
    sizes : {
      small  : { id : 'small',  arrayLength : 19, clipHeight: 9,  description : "10 Hexagon" },
      medium : { id : 'medium', arrayLength : 23, clipHeight: 11, description : "12 Hexagon" },
      large  : { id : 'large',  arrayLength : 27, clipHeight: 13, description : "14 Hexagon" }
  }
}

exports.timer = 0.5;