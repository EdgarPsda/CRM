const User = require('../models/User');
const Product = require('../models/Product');
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
        getUser: async (_, { token }) => {
            console.log(token);
            const userId = await jwt.verify(token, process.env.SECRET);

            return userId;
        },

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

        }

    }
}

module.exports = resolvers;