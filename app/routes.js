module.exports = function(app) {

  app.get('/', function(req, res){
    res.render('index.jade', { title : 'Gamut - Home' });
  });

  // app.post('/', function(req, res){
  //   console.log(req.body.name);
  //   console.log(req.body.gameSize);
  //   res.redirect('/game');
  // });

}