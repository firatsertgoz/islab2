
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('https://app81941791-ZJ7yAx:b.vlpLAedfPBr3.pAweARESoxpdFMlR@hobby-mpjaalnpmpbfgbkejidaehal.dbs.graphenedb.com:24780');
bodyParser = require('body-parser');


exports.getallmovies = function(req, res,next) {
    db.cypher({
        query: 'MATCH (n:Movie) RETURN n',
    }, function(err, results){
        var result = results;
        if (err) {
            console.error('Error finding movies to database:', err);
        } else {
            results.forEach(function(result) {
                console.log('Returned the movies: ', result);
                
            }, this);
            res.send(results)
           // next()
        }
    });
  };

  exports.getmoviebydirector = function(req,res,next){
      db.cypher({
          query:'MATCH (n:Person { name: {director} })-[:DIRECTED]-(movies) RETURN movies',
          params: {
            director: req.body.director
        }}, function(err, results){
            var result = results[0];
            if (err) {
                console.error('Error finding any movie with the director:', err);
            } else {
                console.log('Movies that are directed by the given director', result);
                //next()
                res.send(results)
            }

        }
    );
  }
  exports.getmoviebyactor = function(req,res,next){
    db.cypher({
        query:'MATCH (n:Person { name: {actor} })-[:ACTED_IN]-(movies) RETURN movies',
        params: {
          actor: req.body.actor
      }}, function(err, results){
          if (err) {
              console.error('Error finding any movie with the actor:', err);
          } else {
              console.log('Movies that are acted in by the given actor', results);
              res.send(results)
              //next()
          }
      }
    );
  }
  exports.getalldirectors = function(req, res,next) {
    db.cypher({
        query: 'MATCH (n:Person)-[:DIRECTED]->(movies) RETURN n',
    }, function(err, results){
        if (err) {
            console.error('Error finding directors:', err);
        } else {
            console.log('Returned the directors: ', results);
            //next()
            res.send(results)
        }
    });
  };
  exports.getallactors = function(req, res,next) {
    db.cypher({
        query: 'MATCH (n:Person)-[:ACTED_IN]->(movies) RETURN n',
    }, function(err, results){
        var result = results[0];
        if (err) {
            console.error('Error finding actors:', err);
        } else {
            console.log('Returned the actors: ', result);
            //next()
             res.send(results)
        }
    });
  };