const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeIcon() {
  const inputPath = path.join(__dirname, 'src/assets/spendbook_icon.png');
  const outputDir = path.join(__dirname, 'src/assets/icons/optimized');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Android icon sizes (in pixels)
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  console.log('Optimizing SpendBook icon...');

  // Generate optimized icons for each density
  for (const [folder, size] of Object.entries(sizes)) {
    const folderPath = path.join(outputDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const outputPath = path.join(folderPath, 'ic_launcher.png');

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({
        quality: 90,
        compressionLevel: 9,
        palette: true
      })
      .toFile(outputPath);

    console.log(`✓ Generated ${folder}: ${size}x${size}px`);
  }

  // Also create a web-optimized version for React Native assets
  const webOptimizedPath = path.join(__dirname, 'src/assets/spendbook_icon_optimized.png');
  await sharp(inputPath)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png({
      quality: 85,
      compressionLevel: 9,
      palette: true
    })
    .toFile(webOptimizedPath);

  console.log('✓ Generated web-optimized version: 512x512px');

  // Show file sizes comparison
  const originalStats = fs.statSync(inputPath);
  const optimizedStats = fs.statSync(webOptimizedPath);

  console.log('\n📊 File Size Comparison:');
  console.log(`Original: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized: ${(optimizedStats.size / 1024).toFixed(2)} KB`);
  console.log(`Reduction: ${((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1)}%`);

  console.log('\n✅ Icon optimization complete!');
  console.log('📁 Optimized icons saved to: src/assets/icons/optimized/');
  console.log('🌐 Web-optimized version: src/assets/spendbook_icon_optimized.png');
}

optimizeIcon().catch(console.error);
