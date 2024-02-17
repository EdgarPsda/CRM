const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.DB_MONGO, {

        });

        console.log('DB Connected');

    } catch (error) {
        console.log('Theres an error');
        console.log(error);
        process.exit(1); // Stop app
    }
}

module.exports = connectDB;