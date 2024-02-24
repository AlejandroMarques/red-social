const User = require("../schemas/User");
const bcrypt = require("bcrypt");
const jwtService = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const { checkDocumentExistance, saveDocument, updateDocument, uploadDocument, media, validate } = require("../helper");
const {followUserIds, userFollowsMe} = require('../services/followService');
const Follow = require('../schemas/Follow');
const Publication = require('../schemas/Publication');

const prueba = (req, res) => {
  return res.status(200).json({ message: "User!" });
};

const register = async (req, res) => {
  const params = req.body;

  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({ status: "error", message: "Missing parameters" });
  }

  const valid = await validate(params).catch((err) => {
    return res.status(500).json({status: 'error', message: 'Error validating user'})
  })
  if(!valid) return res.status(400).json({ status: "error", message: "Invalid parameters" });
  
  const user = new User(params);
  const filter = {$or:[{ email: user.email.toLowerCase() },{ nick: user.nick.toLowerCase() },]}
  const {exist} = await checkDocumentExistance(User, filter)
  
  if (exist) return res.status(500).json({ status: "error", message: "User alredy exists" });
  
  user.password = await bcrypt.hash(user.password, 10);
  const result = await saveDocument(user).catch((err) => {
    return res.status(500).json(err)
  });
  return res.status(200).json(result);
};

const login = async (req, res) => {
  const params = req.body;
  if(!params.email) return res.status(400).json({ status: "error", message: "Missing email parameter" });
  try {
    const {exist, docs} = await checkDocumentExistance(User, {$or: [{ email: params.email }]})
    const user = docs[0];
    if (!exist) return res.status(500).json({ status: "error", message: "User does not exists" });
  
    const correct = bcrypt.compareSync(params.password, user.password);
    if (!correct) return res.status(500).json({ status: "error", message: "Wrong password" });
  
    const token = jwtService.generateToken(user);
  
    return res.status(200).json({ 
      status: 'success',
      message: "Login correctly", 
      user: {name: user.name, id: user._id, nick: user.nick}, 
      token
    });
  } catch (error) {
    return res.status(500).json(error)
  }
};

const profile = (req, res) => {
  const reqUser = req.user;
  const id = req.params.id;
  User.findById(id).select({password:0, role:0}).then(async (user) => {
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const followInfo = await userFollowsMe(reqUser.id, id)
    return res.status(200).json({ status: "success", user, following: followInfo.following, follower: followInfo.follower });
  }).catch((err) => {
    return res
      .status(500)
      .json({ status: "error", message: `Error searching user: ${err}` });
  })
}

const list = (req, res) => { 
  const page = req.params.page ? parseInt(req.params.page) : 1;
  const itemsPerPage = 5;
  User.find().select({password:0, role:0, email: 0, __v:0}).sort('_id').paginate(page, itemsPerPage).then(async (users) => {
    if(!users) return res.status(404).json({ status: "error", message: "No users found" });
    const total = await User.countDocuments({}).exec()
    
    const follows = await followUserIds(req.user.id);

    return res.status(200).json({ status: "success", users, following: follows.following, followers: follows.followers, total, pages: Math.ceil(total/itemsPerPage) });
  }).catch((err) => {
    return res.status(500).json({ status: "error", message: `Error listing users: ${err}` });
  })
}

const update = async (req, res) => {
  const userIdentity = req.user;
  const userToUpdate = req.body;
  
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
  const array = []
  if(userToUpdate.email) array.push({ email: userToUpdate.email.toLowerCase() })
  if(userToUpdate.nick) array.push({ nick: userToUpdate.nick.toLowerCase() })
  const filter = {$or:array}
  try{
    if(array.length > 0) {
      const {docs} = await checkDocumentExistance(User, filter)
    
      const exist = docs.some((user) => user._id.toString() !== userIdentity.id);
    
      if(exist) return res.status(500).json({ status: "error", message: "User alredy exists" });
    }
  
    if(userToUpdate.password !== userIdentity.password){
      userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10); 
    }
    else delete userToUpdate.password;
    const user = await updateDocument(User, {_id: userIdentity.id}, userToUpdate)
    return res.status(200).json({ status:'succes', message: "User updated", user });
  } catch(error){
    return res.status(500).json(error);
  }
}

const upload = async (req, res) => {
  const files = req.files? req.files : [];
  const result = await uploadDocument(User, {_id: req.user.id}, {image: req.file.filename}, req.file, files).catch((err) => {
    return res.status(500).json(err);
  })
  return res.status(200).json(result);
}

const avatar = async (req, res) => {
  const result = await media(req.params.file, './uploads/avatars').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}

const counters = async (req, res) => {
  const id = req.params.id? req.params.id : req.user.id;
  try {
    const following = await Follow.count({user: id})
    const followers = await Follow.count({followed: id})
    const publications = await Publication.count({user: id})
    return res.status(200).json({status: 'success', following, followers, publications})
  } catch (error) {
    return res.status(500).json({status: 'success', message:error.message})
  }
}

module.exports = {
  prueba,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters
};
