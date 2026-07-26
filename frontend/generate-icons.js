const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, 'public/logo.png');
const outputDir = path.join(__dirname, 'public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Created public/icons/ directory');
}

// Generate icons for each size
async function generateIcons() {
  try {
    console.log('🚀 Starting icon generation from public/logo.png...\n');
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for transparent logos
        })
        .toFile(outputPath);
        
      console.log(`✅ Created icon-${size}x${size}.png`);
    }
    
    console.log('\n🎉 All icons generated successfully in public/icons/');
    console.log('💡 You can now safely delete this generate-icons.js file if you want.');
  } catch (error) {
    console.error('\n❌ Error generating icons. Make sure public/logo.png exists!');
    console.error(error);
  }
}

generateIcons();