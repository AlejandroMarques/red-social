const jwt = require('jwt-simple');
const moment = require('moment');

const generateToken = (user) => { 
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  }
  return jwt.encode(payload, process.env.SECRET);
}

module.exports = {generateToken}