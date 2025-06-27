const fs = require('fs');
const https = require('https');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Download function
const downloadFile = (url, destination) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (error) => {
      fs.unlink(destination, () => {});
      reject(error);
    });
  });
};

// Main function
const main = async () => {
  try {
    // Download WCT logo (using a direct URL to the logo)
    const logoUrl = 'https://www.wildlifeconservationtrust.org/wp-content/themes/wct/assets/images/logo.png';
    const faviconPath = path.join(publicDir, 'favicon.ico');
    const icon192Path = path.join(iconsDir, 'icon-192x192.png');
    const icon512Path = path.join(iconsDir, 'icon-512x512.png');
    
    console.log('Downloading WCT logo...');
    await downloadFile(logoUrl, faviconPath);
    
    // Copy the same logo for the icon files (in a real app, you'd want properly sized icons)
    fs.copyFileSync(faviconPath, icon192Path);
    fs.copyFileSync(faviconPath, icon512Path);
    
    console.log('Logo and icons downloaded successfully!');
  } catch (error) {
    console.error('Error downloading logo:', error);
  }
};

main();
