
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env['GRAPHENEDB_URL']);

var session = driver.session();



exports.getallmovies = function(req, res) {
    db.cypher({
        query: 'MATCH (n:Movie) RETURN n',
    }, function(err, results){
        var result = results[0];
        if (err) {
            console.error('Error finding movies to database:', err);
        } else {
            console.log('Returned the movies: ', result);
        }
    });
  };

  exports.getmoviebydirector = function(req,res){
      db.cypher({
          query:'MATCH (n:Person { name: {personName} })-[:DIRECTED]-(movies) RETURN n,movies',
          params: {
            personName: req.params.personName
        }, function(err, results){
            var result = results[0];
            if (err) {
                console.error('Error finding any movie with the director:', err);
            } else {
                console.log('Movies that are directed by the given director', result);
            }
        }
    });
  }
  exports.getmoviebyactor = function(req,res){
    db.cypher({
        query:'MATCH (n:Person { name: {personName} })-[:ACTED_IN]-(movies) RETURN n,movies',
        params: {
          personName: req.params.personName
      }, function(err, results){
          var result = results[0];
          if (err) {
              console.error('Error finding any movie with the actor:', err);
          } else {
              console.log('Movies that are acted in by the given actor', result);
          }
      }
  });
  }
  exports.getalldirectors = function(req, res) {
    db.cypher({
        query: 'MATCH p=()-[r:DIRECTED]->() RETURN p',
    }, function(err, results){
        var result = results[0];
        if (err) {
            console.error('Error finding directors:', err);
        } else {
            console.log('Returned the directors: ', result);
        }
    });
  };
  exports.getallactors = function(req, res) {
    db.cypher({
        query: 'MATCH p=()-[r:ACTED_IN]->() RETURN p',
    }, function(err, results){
        var result = results[0];
        if (err) {
            console.error('Error finding actors:', err);
        } else {
            console.log('Returned the actors: ', result);
        }
    });
  };