const Follow = require('../schemas/Follow');
const User = require('../schemas/User');
const { checkDocumentExistance, saveDocument, updateDocument, deleteDocument,  } = require("../helper");
const mongoosePagination = require("mongoose-pagination");
const { userFollowInfo } = require('../services/followService');

const prueba = (req, res) => { 
  return res.status(200).send({message : 'Follow!'});
}

const follow = async (req, res) => {
  const follow = new Follow({
    user: req.user.id,
    followed:req.body.followed
  });
  try {
    const filter = {$and: [{user: follow.user, followed: follow.followed}]}
    const {exist} = await checkDocumentExistance(Follow, filter)
    if (exist) return res.status(500).json({ status: "error", message: "You are alredy following this user" });
    const saved = await saveDocument(follow);
    return res.status(200).send({status: 'success', message : 'Follow!', saved, identity: req.user});
  } catch (error) {
    return res.status(500).json(error)
  }
}

const unfollow = async (req, res) => {
  const unfollow = req.params.id;
  const user = req.user.id;
  try {
    const deleted = await deleteDocument(Follow, {user, followed: unfollow}, res)
    return res.status(200).send({status: 'success', message : 'Unfollow!', deleted, identity: req.user});
  } catch (error) {
    return res.status(500).json(error)    
  }
}

const following = async (req, res) => {
  const followInfo = await userFollowInfo(req, Follow, 'user', 'user followed', '-password -role -__v -email').catch((err) => {
    return res.status(500).json(err)
  })
  return res.status(200).send(followInfo);
}

const followers = async (req, res) => {
  const followInfo = await userFollowInfo(req, Follow, 'followed', 'user followed', '-password -role -__v -email').catch((err) => {
    return res.status(500).json(err)
  })
  return res.status(200).send(followInfo);
}

module.exports = {
  prueba,
  follow,
  unfollow,
  following,
  followers
}