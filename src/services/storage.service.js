const { supabase } = require('../config/storage');
require('dotenv').config();
const path = require('path');

const options = {
  cacheControl: '3600',
  upsert: false,
}

exports.saveImage = async (imageBuffer, folder, fileName) => {
  const pathFile = folder + "/" + fileName;
  const contentType = generateContentType(fileName);
  const { error, data } = await supabase.storage
    .from(process.env.BUCKET_NAME)
    .upload(pathFile, imageBuffer, {
      contentType,
      cacheControl: options.cacheControl,
      upsert: options.upsert,
    });

  if (error) {
    console.error('Error uploading:', error.message);
  } else {
    console.log('File uploaded successfully:', data);
  }

  return { error, data };
};

const generateContentType = (imgName) => {
  const ext = path.extname(imgName).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpeg';
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

exports.imageLink = async (folder, fileName) => {
  
  const { data, error } = supabase
    .storage
    .from(process.env.BUCKET_NAME)
    .getPublicUrl('public/images/profile/8a718532-c121-491c-bb49-eb4a95531148.jpg')
  
  if (error) {
    console.error('Error downloading:', error.message);
  }
  return { data, error };

}
