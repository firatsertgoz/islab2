var _ = require('lodash');
var express = require('express');
var graphqlHTTP = require('express-graphql');
var {
  buildSchema,
  GraphQLObjectType,
  GraphQLList
} = require('graphql');
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "password"));

var session = driver.session();

var qltools = require('graphql-tools');

var typeDefs = ` 

type Person{
  id : ID
  name: String
  born: Int
  acted: [Movie]
  produced: [Movie]
  wrote: [Movie]
  directed: [Movie]
}

type Movie {
  id: ID
  title: String
  year: Int
  cast: [Person]
  reviewer:[Person]
}

type Query {
    people(subString: String!, limit:Int): Person
    movies(subString: String, limit: Int): [Movie]
    getMovie(id: ID!): Movie
    getPerson(id: ID!): Person

  }
  `;

  var Person = function (_node) {
    _.extend(this, _node.properties);
    if (this.id) { 
      this.id = this.id.toNumber();
    }
    if (this.born) {
      this.born = this.born.toNumber();
    }
  };
  

  var PersonDetails = function (record) {
    if (record.length) {
      var result = {};
      _.extend(result, new Person(record.get('person')));

      result.directed = _.map(record.get('directed'), record => {
        if (record.id) {
          record.id = record.id.toNumber();
        }
        return record;
      });
      result.produced = _.map(record.get('produced'), record => {
        if (record.id) {
          record.id = record.id.toNumber();
        }
        return record;
      });
      result.wrote = _.map(record.get('wrote'), record => {
        if (record.id) {
          record.id = record.id.toNumber();
        }
        return record;
      });
      result.actedIn = _.map(record.get('acted'), record => {
        if (record.id) {
          record.id = record.id.toNumber();
        }
        return record;
      });
      // result.related = _.map(record.get('related'), record => {
      //   if (record.id) {
      //     record.id = record.id.toNumber();
      //   }
      //   return record;
      // });
      return result;
    }
    else {
      return null;
    }
  };

  var MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
      title: { type: GraphQLString },
      year: {type: Int},
      cast: {type: GraphQLList(PersonType)},
      reviewer:{type: GraphQLList(PersonType)}
    })
  });


// class Person {
//   constructor(id, name, {born}) {
//     this.id = id;
//     this.name = name;
//     this.born = born;
//     this.reviewed = reviewed;
//     this.acted = acted;
//     this.wrote = wrote;
//   }
// }

var root = {
  movies: (params) => {
    console.log("you're here now")
    let query = "MATCH (movie:Movie) WHERE movie.title CONTAINS $subString RETURN movie;"
    return session.run(query, params).then(result => {return result.records.map(record => {return record.get("movie").properties})
    console.log(query + "ran with Parameters:" + params)
      })
    //session.close();
  },

  people: (params) => {
    var query = [
      'MATCH (person:Person) WHERE person.name CONTAINS $subString',
      'MATCH (person)-[r:ACTED_IN]->(a:Movie)',
      'OPTIONAL MATCH (person)-[:DIRECTED]->(d:Movie)',
      'OPTIONAL MATCH (person)<-[:PRODUCED]->(p:Movie)',
      'OPTIONAL MATCH (person)<-[:WRITER_OF]->(w:Movie)',
      'RETURN person,',
      'collect({ name:d}) AS directed,',
      'collect({ name:p}) AS produced,',
      'collect({ name:w}) AS wrote,',
      'collect (a) AS acted'
    ].join('\n');

    //let query = "MATCH (people:Person) WHERE people.name CONTAINS $subString RETURN people;"
    return session
    .run(query, params)
    .then(result => {
      if (!_.isEmpty(result.records)) {
        return PersonDetails(result.records[0]);
      }
      else {
        //throw {message: 'person not found', status: 404}
      }
    });
      //session.close(); 
  },
  Person: {
    acted(person) {
      let session = driver.session(),
          params = {name: person.name},
          query = [
                'MATCH (person:Person) WHERE person.name CONTAINS $subString',
                'MATCH (person)-[r:ACTED_IN]->(a:Movie)'
              ].join('\n');
          console.log(query);
          
      return session.run(query, params)
        .then( result => { return result.records.map(record => { return record.get("movie").properties })})
    },
    reviewed(movie) {
      let session = driver.session(),
          params = {movieId: movie.name},
          query = `MATCH (p:Person)-[:REVIEWED]-(movies) RETURN movies`
      return session.run(query, params)
        .then( result => { return result.records.map(record => { return record.get("movies") })})
    }
  },

  movies: (params) => {
    console.log("you're here now")
    let query = "MATCH (movie:Movie) WHERE movie.title CONTAINS $subString RETURN movie;"
    return session.run(query, params).then(result => {return result.records.map(record => {return record.get("movie").properties})
    console.log(query + "ran with Parameters:" + params)
      })
    //session.close();
  },

  // people: (params) => {
  //   let query = "MATCH (people:Person) WHERE people.name CONTAINS $subString RETURN people;"
  //   return session.run(query, params).then(result => {return result.records.map(record => {return record.get("people").properties})
  //     })
  //     //session.close(); 
  // }

  
  
};

const schema = qltools.makeExecutableSchema({
  typeDefs,
  root
});


var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
