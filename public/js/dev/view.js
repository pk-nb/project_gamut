function printFeedback(string) {
  $('#debug').append("<p>" + string + "</p>");
}

/* View Binding
 *************************************/
$(function() {

  $("#sendPoke").click(function() { sendPoke() });
  $('#debug').hide();

  $('#newGameForm').on('submit', function(e) {

    // HTML5 Form valdation for supporting browsers
    if (this.checkValidity()) {};

    e.preventDefault();
    console.log("Form intercept!");

    // Get data : value list of form inputs
    var formParams = $(this).serializeArray();
    userName = formParams[0].value;


    console.log(formParams);
    startGame(formParams);
  });


});