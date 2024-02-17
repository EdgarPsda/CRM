const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');

// Connect to Mongo DB
connectDB();



const server = new ApolloServer({
    typeDefs,
    resolvers
});

// Run server
server.listen().then(({ url }) => {
    console.log(`Server ready in URL ${url}`);
});