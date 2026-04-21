const jimp = require('jimp');
async function resize() {
  try {
    console.log('Starting resize...');
    const image = await jimp.read('public/app-icon.jpg');
    console.log('Original size:', image.bitmap.width, 'x', image.bitmap.height);
    
    await image.clone().resize(192, 192).write('public/icon-192.png');
    console.log('Created icon-192.png');
    
    await image.clone().resize(512, 512).write('public/icon-512.png');
    console.log('Created icon-512.png');
  } catch (err) {
    console.error('Error resizing:', err);
  }
}
resize();
