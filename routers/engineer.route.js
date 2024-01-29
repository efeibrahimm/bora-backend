const router = require('express').Router();
const engineerController = require("../controller/engineer.controller");

router.post('/registraiton', engineerController.register);
router.post('/login', engineerController.login);
router.put('/changepass', engineerController.changePassword);
router.get('/allengineer', engineerController.getAllEngineers);
router.post('/token', engineerController.updateTokenById);

module.exports= router;