const { verifyToken } = require("../utils/token/tokenService");
const CustomError = require("../utils/CustomError");

const verifyTokenMw = async (req, res, next) => {
  try {
    console.log('here0');
    if (!req.headers["x-auth-token"])
      throw new CustomError("please provide token");
    const userData = await verifyToken(req.headers["x-auth-token"]);
    req.userData = userData;
    next();
  } catch (err) {
    let errToSend;
    if (err instanceof CustomError) {
      errToSend = err;
    } else {
      errToSend = new CustomError("invalid token");
    }
    res.status(401).json(errToSend.msg);
  }
};
module.exports = verifyTokenMw;
