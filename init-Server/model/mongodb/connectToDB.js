const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");

console.log("connecting to DB at : mongodb + srv://ibrahimseh:2Abra2Seh@autoalliancecluster.gankyau.mongodb.net/AutoAlliance?retrywrites=true&w=majority");

const connectToDB = () => {
  //console.log("process.env.MONGO_URL = " + process.env.MONGO_URL);
  return mongoose.connect(process.env.MONGO_URL);
};

module.exports = connectToDB;
