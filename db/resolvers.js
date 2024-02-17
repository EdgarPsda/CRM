const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });


const createToken = (user, secret, expiresIn) => {
    const { id, email, name, lastName } = user;

    return jwt.sign({ id, email, name, lastName }, secret, { expiresIn });
}

// Resolvers
const resolvers = {
    Query: {

        // Users
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.SECRET);

            return userId;
        },

        // Products
        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;

            } catch (error) {
                console.log(error);

            }
        },

        getProduct: async (_, { id }) => {
            const product = await Product.findById(id);

            if (!product) {
                throw new Error("Product not found");
            }

            return product;
        },

        // Clients
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients;

            } catch (error) {
                console.log(error);
            }
        },

        getClientsByVendor: async (_, { }, ctx) => {
            try {
                const clients = await Client.find({ vendor: ctx.user.id.toString() })
                return clients;
            } catch (error) {
                console.log(error);
            }
        },

        getClient: async (_, { id }, ctx) => {
            // Check if the client exists
            const client = await Client.findById({ _id: id });

            if (!client) {
                throw new Error("Client not found");
            }
            // Only view for vendor who has created the client
            if (client.vendor.toString() !== ctx.user.id) {
                throw new Error("You don\'t have access to this client");
            }

            return client;
        }


    },
    Mutation: {
        // Create User Mutation
        newUser: async (_, { input }) => {
            const { email, password } = input;

            // Check if the user already exists
            const userExist = await User.findOne({ email });
            if (userExist) {
                throw new Error("User already exist");
            }

            // Hass password
            const salt = await bcryptjs.genSaltSync(10);
            input.password = bcryptjs.hashSync(password, salt);

            // Save into DB
            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error);
            }
        },

        // Auth User Mutation
        authenticateUser: async (_, { input }) => {
            const { email, password } = input;

            // If user exist
            const userExist = await User.findOne({ email });

            if (!userExist) {
                throw new Error("User not exist");
            }

            // Check if password is correct
            const passwordCorrect = await bcryptjs.compare(password, userExist.password);
            if (!passwordCorrect) {
                throw new Error("Password incorrect");
            }

            // Create Token
            return {
                token: createToken(userExist, process.env.SECRET, '24h')
            }
        },

        // Product Mutation
        newProduct: async (_, { input }) => {
            try {
                const product = new Product(input);

                const result = await product.save();
                return result;

            } catch (error) {
                console.log(error);
            }
        },

        updateProduct: async (_, { id, input }) => {
            let product = await Product.findById(id);

            if (!product) {
                throw new Error("Product not found");
            }

            product = await Product.findOneAndUpdate({ _id: id }, input, { new: true });

            return product;
        },

        deleteProduct: async (_, { id }) => {
            let product = await Product.findById(id);

            if (!product) {
                throw new Error("Product not found");
            }

            await Product.findOneAndDelete({ _id: id });

            return "Product Deleted";

        },

        // Client Mutation
        newClient: async (_, { input }, ctx) => {
            // Verify if the client is already in DB
            const { email } = input;

            const client = await Client.findOne({ email });

            if (client) {
                throw new Error("Client already created");
            }

            const newClient = new Client(input);

            // Assign vendor
            newClient.vendor = ctx.user.id;
            // Save in DB
            try {
                const result = await newClient.save();

                return result;

            } catch (error) {
                console.log(error);
            }
        },

        updateClient: async (_, { id, input }, ctx) => {
            let client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found");
            }

            if (client.vendor.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions to udpate this client");
            }

            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });

            return client;
        },

        deleteClient: async (_, { id }, ctx) => {
            const client = await Client.findOne({ _id: id });
            if (!client) {
                throw new Error("Client not found");
            }

            if (client.vendor.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions to delete this client");
            }

            try {
                await Client.findOneAndDelete({ _id: id });
                return "Client deleted";

            } catch (error) {
                console.log(error);
            }
        }

    }
}

module.exports = resolvers;