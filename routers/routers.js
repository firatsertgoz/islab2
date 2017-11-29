module.exports = function(app) {
    var restAPI = require('../controller/controller');
  
    
    app.route('/movies')
      .get(restAPI.getallmovies)
      .post(restAPI.createmovie)
      .post(restAPI.getmoviebydirector)
      .post(restAPI.getmoviebyactor)

    app.route('/director')
       .get(restAPI.getalldirectors)
       .post(restAPI.createdirector)
  
    app.route('/actor')
       .get(restAPI.getallactors)
       .post(restAPI.createactor)
    
  };