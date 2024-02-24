const Publication = require('../schemas/Publication');
const helper = require('../helper');
const followService = require('../services/followService');
const prueba = (req, res) => { 
  return res.status(200).send({message : 'Publicacion!'});
}

const save = async (req, res) => {
  const params = req.body;
  if (!params.text) return res.status(200).send({status: 'error', message: 'Text is required'});

  const publication = new Publication(params);
  publication.user = req.user.id;
  const result = await helper.saveDocument(publication).catch((err) => {
    return res.status(500).send({status: 'error', message: err.message});
  })
  return res.status(200).send(result);
}

const detail = async (req, res) => {
  const id = req.params.id;
  if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});

  const publication = await Publication.findById(id).catch((err) => {
    return res.status(500).send(err);
  })
  if(!publication) return res.status(500).send({status: 'error', message: 'Publication not found'})

  return res.status(200).send({status: 'success', message : 'detail!', publication});
}

const remove = async (req, res) => {
  const id = req.params.id;
  if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});
  const filter = {_id: id, user: req.user.id};
  
  const publication = await helper.deleteDocument(Publication, filter).catch((err) => {
    return res.status(500).send(err);
  })
  
  if(!publication) return res.status(500).send({status: 'error', message: 'Publication not found'})
  
  return res.status(200).send({status: 'success', message : 'Publication deleted!', publication});
}

const user = async (req, res) => {
  const id = req.params.id;
  if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});
  const page = req.params.page ? req.params.page : 1;
  const itemsPerPage = 5;
  const filter = {user: id};
  const publications = await Publication.find(filter).sort('-created_at').populate('user', '-password -role -__v -email').paginate(page, itemsPerPage).catch((err) => {
    return res.status(500).send({status:'error', message: err.message})
  })
  if (!publications || publications.length === 0) return res.status(500).send({status:'error', message: 'No publications'})
  const total = await Publication.countDocuments(filter).exec()
  const pages = Math.ceil(total/itemsPerPage)
  return res.status(200).send({status: 'success', message : 'Publications!', user: req.user, total, page, pages, publications})
}

const upload = async (req, res) => {
  if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});
  const result = await helper.uploadDocument(Publication, {_id: req.params.id,user: req.user.id}, {file: req.file.filename}, req.file, files).catch((err) => {
    return res.status(500).json(err);
  })
  return res.status(200).json(result);
}

const media = async (req, res) => {
  const result = await helper.media(req.params.file, './uploads/publications').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}

const feed = async (req, res) => {
  const page = req.params.page ? req.params.page : 1;
  const itemsPerPage = 5;
  const myFollows = await followService.followUserIds(req.user.id);
  const filter = {user: myFollows.following};

  const publications = await Publication.find(filter).sort('-created_at').populate('user', '-password -role -__v -email').paginate(page, itemsPerPage).catch((err) => {
    return res.status(500).send({status:'error', message: err.message})
  })

  const total = await Publication.countDocuments(filter).exec()

  return res.status(200).send({status: 'success', message : 'Feed!', following: myFollows.following, followers: myFollows.followers, publications, page, pages: Math.ceil(total/itemsPerPage), total});
}

module.exports = {
  prueba,
  save,
  detail,
  remove, 
  user, 
  upload,
  media, 
  feed
}