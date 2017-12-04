
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

var DataLoader = require('dataloader');

var userLoader = new DataLoader(keys => myBatchGetUsers(keys));

var makeExecutableSchema = require('graphql-tools');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(` 

type Person{
  id: ID
  name: String
  born: Int
  acted: [Movie]
  reviewed:[Movie]
}

type Movie {
  movieId: ID
  title: String
  year: Int
  cast: [Person]
  reviewer:[Person]
}

type Query {
    people(subString: String!, limit:Int): [Person]
    movies(subString: String, limit: Int): [Movie]
    getMovie(id: ID!): Movie
    getPerson(id: ID!): Person

  }
  `);

// This class implements the Movie GraphQL type
class Movie {
  constructor(movieId, title, { year }) {
    this.movieId = id;
    this.title = title;
    this.year = year;
    this.cast = cast;
    this.crew = crew;
  }
}

// This class implements the Person GraphQL type
class Person {
  constructor(id, name, { born }) {
    this.id = id;
    this.name = name;
    this.born = born;
    this.reviewed = reviewed;
    this.acted = acted;
    this.wrote = wrote;
  }
}

// The root provides a resolver function for each API endpoint
// var root = {
//   movies: () => {
//     return 'Hello world!';
//   },
// };

var root = {

  Person: {
    acted(person) {
      // we define similarity to be movies with overlapping genres, we could use a more complex
      // Cypher query here to use collaborative filtering based on user ratings, see Recommendations
      // Neo4j Sandbox for more complex examples
      let session = driver.session(),
          params = { name: person.name },
          query = `
          MATCH (p:Person)-[:ACTED_IN]->(movie:Movie) 
          WHERE p.name CONTAINS $name
          RETURN movie;`;
      console.log(query);

      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("movie").properties;
        });
      });
    },
    reviewed(movie) {
      // Movie genres are represented as relationships in Neo4j so we need to query the database
      // to resolve genres
      let session = driver.session(),
          params = { movieId: movie.name },
          query = `MATCH (p:Person)-[:REVIEWED]-(movies) RETURN movies`;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("movies");
        });
      });
    }
  },

  movies: params => {
    console.log("you're here now");
    let query = "MATCH (movie:Movie) WHERE movie.title CONTAINS $subString RETURN movie;";
    return session.run(query, params).then(result => {
      return result.records.map(record => {
        return record.get("movie").properties;
      });
      console.log(query + "ran with Parameters:" + params);
    });
    //session.close();
  },

  people: params => {
    let query = "MATCH (people:Person) WHERE people.name CONTAINS $subString RETURN people;";
    return session.run(query, params).then(result => {
      return result.records.map(record => {
        return record.get("people").properties;
      });
    });
    //session.close(); 
  }

  // Movie: {
  //   // the similar field in the Movie type is an array of similar Movies
  //   similar(movie) {
  //     // we define similarity to be movies with overlapping genres, we could use a more complex
  //     // Cypher query here to use collaborative filtering based on user ratings, see Recommendations
  //     // Neo4j Sandbox for more complex examples
  //     let session = driver.session(),
  //         params = {movieId: movie.movieId},
  //         query = `MATCH (n:Person { name: {actor} })-[:ACTED_IN]-(movies) RETURN movies`
  //     return session.run(query, params)
  //       .then( result => { return result.records.map(record => { return record.get("movie").properties })})
  //   },
  //   genres(movie) {
  //     // Movie genres are represented as relationships in Neo4j so we need to query the database
  //     // to resolve genres
  //     let session = driver.session(),
  //         params = {movieId: movie.movieId},
  //         query = `
  //           MATCH (m:Movie)-[:IN_GENRE]->(g:Genre)
  //           WHERE m.movieId = $movieId
  //           RETURN g.name AS genre;
  //         `
  //     return session.run(query, params)
  //       .then( result => { return result.records.map(record => { return record.get("genre") })})
  //   }
  // }
};
export default root;

const executableSchema = makeExecutableSchema({
  schema,
  root
});

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
