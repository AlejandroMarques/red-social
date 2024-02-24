const express = require('express');
const controller = require('../controllers/publication');
const {auth} = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/publications'),
  filename: (req, file, cb) => cb(null, `pub-${Date.now()}-${file.originalname}`)
})
const upload = multer({storage});

router.get('/test', controller.prueba);
router.post('/save', [auth], controller.save);
router.get('/detail/:id', [auth], controller.detail);
router.delete('/delete/:id', [auth], controller.remove);
router.get('/user/:id/:page?', [auth], controller.user);
router.post('/upload/:id', [auth, upload.single('file')], controller.upload);
router.get('/media/:file', controller.media);
router.get('/feed/:page?', [auth], controller.feed);

module.exports = router;