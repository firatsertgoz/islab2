module.exports = function(app) {
    var restAPI = require('../controller/controller');
  
    
    app.route('/movies')
      .get(restAPI.getallmovies)
      //.post(restAPI.createmovie)
      //.post(restAPI.getmoviebydirector)
      
    app.route('/movies:actor')
      .get(restAPI.getmoviebyactor)

    app.route('/movies:director')
      .get(restAPI.getmoviebydirector)

    app.route('/director')
       .get(restAPI.getalldirectors)
       //.post(restAPI.createdirector)
  
    app.route('/actor')
       .get(restAPI.getallactors)
      // .post(restAPI.createactor)
    
  };