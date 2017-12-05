
var express = require('express');
var graphqlHTTP = require('express-graphql');
var {
  buildSchema,
  GraphQLObjectType,
  GraphQLList
} = require('graphql');
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "password"));
var cors = require ('cors');
var session = driver.session();

var { graphqlExpress, graphiqlExpress } = require('apollo-server-express')

var bodyParser = require('body-parser');

var qltools = require('graphql-tools')

var schema = buildSchema( `
type Person{
  id : ID
  name: String
  born: Int
  acted: [String]
  produced: [Movie]
  reviewed: [Movie]
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
  people(subString: String!, limit:Int): [Person]
  movies(subString: String, limit: Int): [Movie]
} 
`)

var root = {
    people: (params) => {
      console.log(params)
      var query = 'MATCH (people:Person) WHERE people.name CONTAINS $subString RETURN people;'
      return session.run(query, params)
      .then( result => { return result.records.map(record => { return record.get("people").properties })})
        //session.close(); 
    },

    movies: (params) => {
      console.log("you're here now")
      let query = "MATCH (movie:Movie) WHERE movie.title CONTAINS $subString RETURN movie;"
      return session.run(query, params).then(result => {return result.records.map(record => {return record.get("movie").properties})
      console.log(query + "ran with Parameters:" + params)
        })
      //session.close();
    },

    Person: {
      acted(person) {
        console.log("We arrived here")
        let session = driver.session(),
            params = {name: person.name},
            query = `
            'MATCH (person:Person {pname:$name})-[:ACTED_IN]->(movie:Movie)',
            RETURN movie.title;`
            console.log(query);
            
        return session.run(query, params)
          .then( result => { return result.records.map(record => { return record.get("movie").properties })})
      },
      // produced(person) {
      //   console.log(person.name)
      //   let session = driver.session(),
      //       params = {name: person.name},
      //       query = `
      //       'MATCH (person:Person {pname:$name})-[:ACTED_IN]->(movie:Movie)',
      //       RETURN movie;`
      //       console.log(query);
            
      //   return session.run(query, params)
      //     .then( result => { return result.records.map(record => { return record.get("movie").properties })})
      // },
    }
    

    //complete person and Movie lists
};


// const schema = qltools.makeExecutableSchema({
//   typeDefs,
//   resolver
// });


var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
