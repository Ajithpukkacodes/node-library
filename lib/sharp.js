var path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

// Access Control
exports.generate_thumb = async function(req, res, next){
  console.log("cddcdcdcdvcdc asdswd");
  return await sharp(path.resolve(req.file.path))
  .resize(100)
  .jpeg({quality: 50})
  .toFile(req.file.destination + '/' + "thumb_" + req.file.filename)
};
