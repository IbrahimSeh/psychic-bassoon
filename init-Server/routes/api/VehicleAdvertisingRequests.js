const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
//const carsValidationService = require("../../validation/carsValidationService");
const joiCarsValidation = require("../../validation/joi/carsValidation");
//const varQueriesModel = require("../../model/varsService/varsQueries");
const varServiceMongo = require("../../model/mongodb/VAR/VARServices");
const normalizeCar = require("../../model/mongodb/cars/helpers/normalizationCar");
const isSubscriptionMw = require("../../middleware/isSubscriptionMW");
const tokenMw = require("../../middleware/verifyTokenMW");
const registeredUserMw = require("../../middleware/registeredUserMw");
const isAdminMw = require("../../middleware/isAdminMW");
const { isValidObjectId } = require("../../utils/objectID/verifyObjectID");
const CustomError = require("../../utils/CustomError");

// VAR = Vehicle Advertising Requests

//http://localhost:8181/api/VAR 
router.get("/", async (req, res) => {
    try {
        const allVARs = await varServiceMongo.getAllVARs();
        res.json(allVARs);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/get-my-fav-vars v
router.get("/get-my-fav-vars", tokenMw, async (req, res) => {
    try {
        const userVars = await varServiceMongo.getUserFavVars(req.userData._id);
        return res.send(userVars);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/From-Outside/:flag v
router.get("/From-Outside/:flag", async (req, res) => {
    try {
        const allVARs = await varServiceMongo.getVARByFlag(req.params.flag);
        res.json(allVARs);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/:id v
router.get("/:id", async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        const carFromDB = await varServiceMongo.getVARById(req.params.id);
        if (!carFromDB) throw new CustomError("Sorry ,car not found in database !");
        res.json(carFromDB);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR v
router.post("/", tokenMw, isSubscriptionMw, async (req, res) => {
    try {
        await joiCarsValidation.validateCarSchema(req.body);
        let normalVAR = await normalizeCar(req.body, jwt.decode(req.headers["x-auth-token"])._id);
        const dataFromMongoose = await varServiceMongo.createVAR(normalVAR);
        res.json(dataFromMongoose);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/:id v
router.patch("/:id", tokenMw, isAdminMw, async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        const VARFromDB = await varServiceMongo.getVARById(req.params.id);
        if (!VARFromDB) throw new CustomError("Sorry ,user not found in database !");
        VARFromDB.toPublish = !VARFromDB.toPublish;
        await varServiceMongo.updateVAR(req.params.id, VARFromDB);//update to publish (true/false)
        res.json(VARFromDB);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/:id v
router.delete("/:id", tokenMw, isAdminMw, async (req, res) => {
    try {
        const deletedCar = await varServiceMongo.deleteVAR(req.params.id);
        if (!deletedCar) throw new CustomError("Sorry ,car not found in database !");
        res.json(deletedCar);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/VAR/VAR-like/:id v
router.patch("/VAR-like/:id", tokenMw, async (req, res) => {
    try {
        const user = req.userData;
        let VAR = await varServiceMongo.getVARById(req.params.id); // VAR = Vehicle Advertising Requests
        const varLikes = VAR.likes.find((id) => id === user._id);
        if (!varLikes) {
            VAR.likes.push(user._id);
            VAR = await VAR.save();
            return res.send(VAR);
        }
        const carFiltered = VAR.likes.filter((id) => id !== user._id);
        VAR.likes = carFiltered;
        VAR = await VAR.save();
        return res.send(VAR);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;