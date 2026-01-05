const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ALLOWED_IMAGE_HOSTS = [
  'res.cloudinary.com',
  'console.cloudinary.com',
  'images.unsplash.com',
  's3.amazonaws.com',
  'amazonaws.com',
];

function isLikelyImageUrl(url) {
  try {
    const parsed = new URL(url);
    const hostOk = ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname.includes(host));
    const extOk = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(parsed.pathname);
    return hostOk || extOk;
  } catch (err) {
    return false;
  }
}

async function findInvalidImages() {
  try {
    const uri =
      process.env.MONGODB_ATLAS_URL ||
      process.env.DATABASE_URL ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/pakautose';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Check specific image collections (include parts and service requests)
    const imageCollections = ['generatorimages', 'partimages', 'serviceimages', 'banners'];
    
    for (const col of imageCollections) {
      try {
        const docs = await db.collection(col).find({}).toArray();
        console.log(`\n${col}: ${docs.length} documents`);
        
        for (const doc of docs) {
          if (doc.url && !isLikelyImageUrl(doc.url)) {
            console.log(`  Suspicious URL in ${col}:`, doc._id.toString());
            console.log(`    URL: ${doc.url}`);
          }
        }
      } catch (e) {
        console.log(`Error checking ${col}:`, e.message);
      }
    }
    
    // Check parts and service requests for missing image references
    const partsWithoutImages = await db
      .collection('parts')
      .find({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] })
      .project({ _id: 1, name: 1, slug: 1 })
      .toArray();
    if (partsWithoutImages.length) {
      console.log(`\nparts with no images: ${partsWithoutImages.length}`);
      partsWithoutImages.slice(0, 20).forEach((part) => {
        console.log(`  Part ${part._id.toString()} (${part.slug || part.name || 'unknown'}) missing images`);
      });
      if (partsWithoutImages.length > 20) {
        console.log('  ...more parts omitted');
      }
    }

    const servicesWithoutImages = await db
      .collection('servicerequests')
      .find({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] })
      .project({ _id: 1, requestNumber: 1 })
      .toArray();
    if (servicesWithoutImages.length) {
      console.log(`\nservice requests with no images: ${servicesWithoutImages.length}`);
      servicesWithoutImages.slice(0, 20).forEach((sr) => {
        console.log(`  ServiceRequest ${sr._id.toString()} (${sr.requestNumber || 'no-number'}) missing images`);
      });
      if (servicesWithoutImages.length > 20) {
        console.log('  ...more service requests omitted');
      }
    }

    // Check user/staff/admin profile images
    const usersWithBadImages = await db
      .collection('users')
      .find({ image: { $exists: true, $ne: null } })
      .project({ _id: 1, email: 1, role: 1, image: 1 })
      .toArray();
    const badUserImages = usersWithBadImages.filter((u) => !isLikelyImageUrl(u.image));
    if (badUserImages.length) {
      console.log(`\nusers with suspicious profile images: ${badUserImages.length}`);
      badUserImages.slice(0, 20).forEach((u) => {
        console.log(`  ${u.role || 'USER'} ${u.email || u._id.toString()} -> ${u.image}`);
      });
      if (badUserImages.length > 20) {
        console.log('  ...more users omitted');
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
