const express = require('express');
const controller = require('../controllers/follow');
const {auth} = require('../middleware/auth');

const router = express.Router();
router.get('/test', controller.prueba);
router.post('/follow', [auth], controller.follow);
router.delete('/unfollow/:id', [auth], controller.unfollow);
router.get('/following:id?/:page?',[auth], controller.following);
router.get('/followers:id?/:page?', [auth], controller.followers);

module.exports = router;