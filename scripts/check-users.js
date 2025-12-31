const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
console.log('Connecting to:', uri ? 'MongoDB...' : 'ERROR: No URI found');

mongoose.connect(uri).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isActive: Boolean
  }));
  
  const users = await User.find({ role: { $in: ['ADMIN', 'STAFF'] } }).select('name email role isActive');
  console.log('Admin/Staff users:');
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.isActive}`);
  });
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
