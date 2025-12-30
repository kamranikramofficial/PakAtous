const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function findInvalidImages() {
  try {
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/pakautose';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Check specific image collections
    const imageCollections = ['generatorimages', 'partimages', 'banners'];
    
    for (const col of imageCollections) {
      try {
        const docs = await db.collection(col).find({}).toArray();
        console.log(`\n${col}: ${docs.length} documents`);
        
        for (const doc of docs) {
          // Check if URL is valid
          if (doc.url) {
            // Check for non-image URLs or suspicious patterns
            if (!doc.url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) && 
                !doc.url.includes('cloudinary') && 
                !doc.url.includes('amazonaws') &&
                !doc.url.includes('unsplash') &&
                !doc.url.includes('placeholder')) {
              console.log(`  Suspicious URL in ${col}:`, doc._id.toString());
              console.log(`    URL: ${doc.url}`);
            }
          }
        }
      } catch (e) {
        console.log(`Error checking ${col}:`, e.message);
      }
    }
    
    console.log('Search complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findInvalidImages();
