var socket = io.connect();


/* Socket
 *************************************/
function startGame(gameParams) {


}




/* View Binding
 *************************************/
$(function() {

  // $('#submit').click( function(e) {
  //   e.preventDefault();
  //   this.checkValidity();
  //   console.log("Form intercepted");
  //   return false;
  // });

  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    if (this.checkValidity()) {};

    e.preventDefault();
    console.log("Form intercept!");

    // Get data : value list of form inputs
    var formParams = $(this).serializeArray();
    console.log(formParams);
    startGame(formParams);
  });


});