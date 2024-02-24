const {Schema, model} = require('mongoose');

const PublicationSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  text: { type: String, required: true},
  file: String,
  created_at: { type: String, default: Date.now },
})

module.exports = model('Publication', PublicationSchema, 'publications');