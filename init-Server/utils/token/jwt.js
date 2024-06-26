const jwt = require("jsonwebtoken");
//const config = require("config");

const generateToken = (payload, expDate = "30d") =>
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      "780y94563hj2y45wopiunj",
      //config.get("jwt"),
      {
        expiresIn: expDate,
      },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token,
      "780y94563hj2y45wopiunj",
      //config.get("jwt"),
      (err, payload) => {
        if (err) reject(err);
        else resolve(payload);
      });
  });

module.exports = { generateToken, verifyToken };
