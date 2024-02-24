const jwt = require('jwt-simple');
const moment = require('moment');

const auth = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(403).json({ status: 'error', message: 'Missing token' });
  token = token.replace(/['"]+/g, '');
  try {
    const payload = jwt.decode(token, process.env.SECRET);
    if (payload.exp <= moment().unix()) return res.status(401).json({ status: 'error', message: 'Token has expired' });
    req.user = payload;
    next();
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Invalid token' }, error);
  }
}

module.exports = {auth}