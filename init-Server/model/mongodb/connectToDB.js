const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");

//console.log("connecting to DB at : " + process.env.MONGO_URL);

const connectToDB = () => {
  return mongoose.connect(process.env.MONGO_URL);
};

module.exports = connectToDB;
