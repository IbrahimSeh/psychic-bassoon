//const config = require("config");
const jwt = require("./jwt");

//const tokenOption = config.get("tokenOption");

const generateToken = (payload, expDate = "30d") => {
  return jwt.generateToken(payload, expDate);
};

const verifyToken = (token) => {
  return jwt.verifyToken(token);
};

module.exports = { generateToken, verifyToken };
