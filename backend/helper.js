const fs = require("fs");
const path = require("path");
const validator = require("validator");

/**Función que comprueba si existe un usuario en la base de datos
 * @param {Array} filter - Array de filtros para la búsqueda
 * @param {Object} select - Objeto con los campos a ocultar en la respuesta
 * @returns {Object} - Objeto que devuelve dos campos: exist (boolean) y users (array de usuarios)
 */
const checkDocumentExistance = (model, filter, select = {}) => {
  return new Promise ((resolve, reject) => {
    model.find(filter).select(select)
    .then((docs) => {
      if(!docs) reject({ status: "error", message: `${model.collection.modelName} not found` })
      resolve({exist : docs.length >= 1, docs});
    }).catch((err) => {
      reject(err);
    });
  })
};

const updateDocument = (model, id, data) => {
  return new Promise ((resolve, reject) => {
    model.findByIdAndUpdate(id, data, { new: true })
    .then((user) => {
      if (!user) {
        reject({ status: "error", message: `${model.collection.modelName} not found` });
      }
      resolve(user);
    }).catch((err) => {
      reject({ status: "error", message: `Error updating ${model.collection.modelName}: ${err}` });
    })
  })
}

const saveDocument = (model) => {
  return new Promise ((resolve, reject) => {
    model
      .save()
      .then((docStored) => {
        resolve({ status: "success", message: `${model.collection.modelName} saved`, doc: docStored });
      })
      .catch((err) => {
        reject({ status: "error", message: `Error saving ${model.collection.modelName}: ${err}` });
      });
  })
};

const deleteDocument = (model, filter) => {
  return new Promise ((resolve, reject) => {
    model.findOneAndDelete(filter)
    .then((found) => {
      if (!found) {
        reject({ status: "error", message: `${model.collection.modelName} not found` });
      }
      resolve(found);
    }).catch((err) => {
      reject({ status: "error", message: `Error deleting ${model.collection.modelName}: ${err}` });
    })
  })
}

const uploadDocument = async(model, filter, data, files = [], fileTypes) => {
  return new Promise (async (resolve, reject) => {
    try {
      if (!files)
        reject({ status: "error", message: "No file uploaded" });
      for (const file of files) {
        const fileName = file.originalname;
        const splitName = fileName.split(".");
        const extension = splitName[splitName.length - 1];
    
        if (!fileTypes.includes(extension)) {
          const filePath = file.path;
          const fileDeleted = fs.unlink(filePath);
          resolve({
            status: "error",
            fileDeleted,
            message: "Invalid file type",
          });
        }
      }
      const doc = await updateDocument(model, filter, data).catch((err) => {
        reject(err);      
      });
      resolve({ status: "success", message: "File uploaded", [model.collection.modelName]: doc, files });
    } catch (error) {
      reject({ status: "error", message: error.message });
    }
  })
}

const media = async (file, pathToFolder) => {
  return new Promise (async (resolve, reject) => {
    const pathFile = `${pathToFolder}/${file}`;
    fs.promises.stat(pathFile).then((stats) => {
        if (!stats) reject({status: 'success', message:`Image not found with id ${req.params.image}`});
        resolve(path.resolve(pathFile));
      }).catch((error) => {
        reject({ status: "error", message: error.message });
      });
  })
}

const validate = (params) => {
  return new Promise ((resolve, reject) => {
    const name = !validator.isEmpty(params.name) && 
                  validator.isLength(params.name, {min: 3, max: undefined}) && 
                  validator.isAlpha(params.name, ['es-ES']);
    const surname = params.surname ? !validator.isEmpty(params.surname) && 
                    validator.isLength(params.surname, {min: 3, max: undefined}) && 
                    validator.isAlpha(params.surname, ['es-ES']) : true;
    const nick = !validator.isEmpty(params.nick) && 
                  validator.isLength(params.nick, {min: 2, max: undefined})
    const email = !validator.isEmpty(params.email) &&
                  validator.isEmail(params.email);
    const password = !validator.isEmpty(params.password)
    const bio = params.bio? !validator.isLength(params.bio, {min: undefined, max: 255}) : true;
    if(!name || !surname || !nick || !email || !password || !bio) reject(false);
    resolve(true);
  })
}

module.exports = {
  checkDocumentExistance,
  updateDocument,
  saveDocument,
  deleteDocument,
  uploadDocument,
  media, 
  validate
}