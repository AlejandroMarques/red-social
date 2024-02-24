const express = require('express');
const controller = require('../controllers/user');
const {auth} = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/avatars'),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}-${file.originalname}`)
})

const upload = multer({storage});

const router = express.Router();
router.get('/test', [auth], controller.prueba);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile/:id', [auth], controller.profile);
router.get('/list/:page?', [auth], controller.list);
router.post('/update', [auth], controller.update);
router.post('/upload', [auth, upload.single('file')], controller.upload);
router.get('/avatar/:file', controller.avatar);
router.get('/counters/:id?', controller.counters);

module.exports = router;