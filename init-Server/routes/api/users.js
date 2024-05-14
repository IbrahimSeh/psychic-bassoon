const express = require("express");
const router = express.Router();
const hashService = require("../../utils/hash/hashService");
const { generateHash } = require("../../utils/hash/bcrypt");
const joiRegisterValidation = require("../../validation/joi/registerValidation");
const joiLoginValidation = require("../../validation/joi/loginValidation");
const joiEditValidation = require("../../validation/joi/EditValidation");
const joiPasswordValidation = require("../../validation/joi/passwordValidation");
const normalizeUser = require("../../model/mongodb/users/helpers/normalizationUser");
//const userQueriesModel = require("../../model/usersService/usersQueries");
const userServiceMongo = require("../../model/mongodb/users/usersService");
const { generateToken } = require("../../utils/token/tokenService");
const CustomError = require("../../utils/CustomError");
const isAdminMw = require("../../middleware/isAdminMW");
const tokenMw = require("../../middleware/verifyTokenMW");
const registeredUserMw = require("../../middleware/registeredUserMw");
const isAdminOrRegisteredMw = require("../../middleware/isAdminOrRegisteredMw");
const { isValidObjectId } = require("../../utils/objectID/verifyObjectID");

//http://localhost:8181/api/users v
router.post("/", async (req, res) => {
    console.log('in post sigin');
    try {
        /*
         * joi
         * email unique - mongoose -> mongo
         * encrypt the password
         * normalize
         * create user
         * response user created
         */
        await joiRegisterValidation.validateRegisterSchema(req.body);
        console.log('in post sigin 1');
        req.body.password = await generateHash(req.body.password);
        console.log('in post sigin 2');
        req.body = normalizeUser(req.body);
        await userServiceMongo.registerUser(req.body);
        res.json(req.body);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        if (err.hasOwnProperty('keyValue')) {
            return res.status(400).send(err.keyValue.email + " is already exist in database");
        }
        res.status(400).json(err);
    }
});


//http://localhost:8181/api/users/login v
router.post("/login", async (req, res) => {
    console.log('in post login');
    try {
        /**
         * *joi
         * *get user from database
         * *check password
         * *create token
         * *send to user  
         */
        await joiLoginValidation.validateLoginSchema(req.body);
        const userData = await userServiceMongo.getUserByEmail(req.body.email);
        if (!userData) throw new CustomError("invalid email and/or password");
        const isPasswordMatch = await hashService.cmpHash(
            req.body.password,
            userData.password
        );
        if (!isPasswordMatch)
            throw new CustomError("invalid email and/or password");
        const token = await generateToken({
            _id: userData._id,
            isAdmin: userData.isAdmin,
            isSubscription: userData.isSubscription,
        });
        res.json({ token });
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/users
router.get("/", tokenMw, isAdminMw, async (req, res) => {
    try {
        const allUsers = await userServiceMongo.getAllUsers();
        res.json(allUsers);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/users/:id v
router.get("/:id", tokenMw, isAdminOrRegisteredMw(true, true), async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        const userFromDB = await userServiceMongo.getUserById(req.params.id);
        if (!userFromDB) throw new CustomError("Sorry ,user not found in database !");
        res.json(userFromDB);
    } catch (err) {
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/users/:id v
router.put("/:id", tokenMw, registeredUserMw, async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        await joiEditValidation.validateEditSchema(req.body);
        const userFromDB = await userServiceMongo.getUserById(req.params.id);
        if (!userFromDB) throw new CustomError("Sorry ,user not found in database !");
        //if the client side try to update email to exist email in DB , mongo will reject
        //update data in DB
        console.log('req.body = ', req.body);
        await userServiceMongo.findByIdAndUpdate(req.params.id, req.body);
        res.json(req.body);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        if (err.hasOwnProperty('keyValue')) {
            return res.status(400).send(err.keyValue.email + " is already exist in database");
        }
        res.status(400).json(err);
    }
});

//http://localhost:8181/api/users/setpassword/:id v
router.put("/setpassword/:id", tokenMw, registeredUserMw, async (req, res) => {
    try {
        const validateID = isValidObjectId(req.params.id);
        if (!validateID) throw new CustomError("object-id is not a valid MongodbID");
        await joiPasswordValidation.validatePasswordSchema(req.body);
        const userFromDB = await userServiceMongo.getUserById(req.params.id);
        if (!userFromDB) throw new CustomError("Sorry ,user not found in database !");
        //if the client side try to update email to exist email in DB , mongo will reject
        //update data in DB
        req.body.password = await hashService.generateHash(req.body.password);
        await userServiceMongo.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.json(req.body);
    } catch (err) {
        if (err.hasOwnProperty('details')) {
            return res.status(400).send(err.details[0].message)
        }
        if (err.hasOwnProperty('keyValue')) {
            return res.status(400).send(err.keyValue.email + " is already exist in database");
        }
        res.status(400).json(err);
    }
});

module.exports = router;