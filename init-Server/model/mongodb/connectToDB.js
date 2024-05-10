//const config = require("config");
const mongoose = require("mongoose");

console.log("connecting to DB at : mongodb + srv://ibrahimseh:2Abra2Seh@autoalliancecluster.gankyau.mongodb.net/AutoAlliance?retrywrites=true&w=majority");

const connectToDB = () => {
  return mongoose.connect("mongodb+srv://ibrahimseh:2Abra2Seh@autoalliancecluster.gankyau.mongodb.net/AutoAlliance?retrywrites=true&w=majority");
};

module.exports = connectToDB;
