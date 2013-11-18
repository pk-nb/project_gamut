var data = require('./data');

module.exports = function(app) {

  app.get('/', function(req, res){
    res.render('index.jade', { title : 'Gamut - Home', gameSizes : data.types.sizes });
  });

  // app.post('/', function(req, res){
  //   console.log(req.body.name);
  //   console.log(req.body.gameSize);
  //   res.redirect('/game');
  // });

}