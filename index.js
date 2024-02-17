const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

// Connect to Mongo DB
connectDB();



const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers.authorization || '';
        if (token) {
            try {
                const user = jwt.verify(token, process.env.SECRET);
                return { user };

            } catch (error) {
                console.log(error);
            }
        }
    }
});

// Run server
server.listen().then(({ url }) => {
    console.log(`Server ready in URL ${url}`);
});