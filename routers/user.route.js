const router = require('express').Router();
const userController = require("../controller/user.controller");

router.post('/registraiton', userController.register);
router.post('/login', userController.login);
router.put('/changepass', userController.changePassword);

module.exports= router;