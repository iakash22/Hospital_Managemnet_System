const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/ho';
console.log(DATABASE_URL);
const dbConnect = () => {
    mongoose.connect(DATABASE_URL)
        .then(() => console.log("Database connected successfull"))
        .catch((err) => {
            console.error('Database connection failed. \n', err);
            process.exit(1);
        })
}

module.exports = dbConnect;