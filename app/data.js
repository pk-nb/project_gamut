exports.users = [];

// Construcutor object for queues
exports.Queues = function() {
  this.small   = [];
  this.medium  = [];
  this.large   = [];
}

exports.types = {
  sizes : {
    small  : {
      id : 'small',
      arrayLength : 19,
      clipHeight: 9,
      startIndexes: { 1: {i: 9, j: 1}, 2: {i: 9, j: 17} },
      description : "10 Hexagon"
    },
    medium : {
      id : 'medium',
      arrayLength : 23,
      clipHeight: 11,
      startIndexes: { 1: {i: 11, j: 1}, 2: {i: 11, j: 21} },
      description : "12 Hexagon"
    },
    large  : {
      id : 'large',
      arrayLength : 27,
      clipHeight: 13,
      startIndexes: { 1: {i: 13, j: 1}, 2: {i: 13, j: 25} },
      description : "14 Hexagon"
    }
  }
}

exports.timer = 0.5;
