const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
//const carQueriesModel = require("../../model/carsService/carsQueries");
const carServiceMongo = require("../../model/mongodb/cars/carsService");
//const carsValidationService = require("../../validation/carsValidationService");
const joiCarsValidation = require("../../validation/joi/carsValidation");
const CustomError = require("../../utils/CustomError");
const normalizeCar = require("../../model/mongodb/cars/helpers/normalizationCar");
const tokenMw = require("../../middleware/verifyTokenMW");
const isAdminMW = require("../../middleware/isAdminMW");
const { isValidObjectId } = require("../../utils/objectID/verifyObjectID");
//http://89.116.111.211/api/
//http://localhost:8181/api/cars v
router.get("/", async (req, res) => {
    try {
        carServiceMongo
        const allCars = await carServiceMongo.getAllCars();
        res.json(allCars);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/get-my-fav-cars v
router.get("/get-my-fav-cars", tokenMw, async (req, res) => {
    try {
        const userCars = await carServiceMongo.getUserFavCars(req.userData._id);
        return res.send(userCars);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/search v
router.get("/search", tokenMw, async (req, res) => {
    try {
        const searchCars = await carServiceMongo.getSearchCars(req.query);
        //console.log('searchCars = ', searchCars);
        return res.send(searchCars);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/:id v
router.get("/:id", async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        const carFromDB = await carServiceMongo.getCarById(req.params.id);
        if (!carFromDB) throw new CustomError("Sorry ,car not found in database !");
        res.json(carFromDB);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars v
router.post("/", tokenMw, isAdminMW, async (req, res) => {
    try {
        await joiCarsValidation.validateCarSchema(req.body);
        let normalCar = await normalizeCar(req.body, jwt.decode(req.headers["x-auth-token"])._id);
        const dataFromMongoose = await carServiceMongo.createCar(normalCar);
        res.json(dataFromMongoose);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/:id v
router.put("/:id", tokenMw, isAdminMW, async (req, res) => {
    try {
        await joiCarsValidation.validateCarSchema(req.body);
        let normalCar = await normalizeCar(req.body, jwt.decode(req.headers["x-auth-token"])._id);
        const carFromDB = await carServiceMongo.getCarById(req.params.id);
        if (!carFromDB) throw new CustomError("Sorry ,car not found in database !");
        const updatedCar = await carServiceMongo.updateCar(
            req.params.id,
            normalCar
        );
        res.json(updatedCar);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/car-like/:id v
router.patch("/car-like/:id", tokenMw, async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        let carFromDB = await carServiceMongo.getCarById(req.params.id);
        if (!carFromDB) throw new CustomError("Sorry ,car not found in database !");
        const userID = jwt.decode(req.headers["x-auth-token"])._id
        //update like array
        if (carFromDB.likes.includes(userID)) {
            //remove userID
            const index = carFromDB.likes.indexOf(userID);
            if (index > -1) { // only splice array when item is found
                carFromDB.likes.splice(index, 1);
            }
        } else {
            //add it
            carFromDB.likes.push(userID);
        }
        const updatedCar = await carServiceMongo.updateCar(
            req.params.id,
            carFromDB
        );
        res.json(updatedCar);

    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/cars/:id v
router.delete("/:id", tokenMw, isAdminMW, async (req, res) => {
    try {
        const deletedCar = await carServiceMongo.deleteCar(req.params.id);
        if (!deletedCar) throw new CustomError("Sorry ,car not found in database !");
        res.json(deletedCar);
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;