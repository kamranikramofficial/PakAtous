const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Use Google DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['USER', 'STAFF', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'BANNED', 'PENDING_VERIFICATION'], default: 'PENDING_VERIFICATION' },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Pakistan' },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  console.log('Connecting to MongoDB...');
  
  await mongoose.connect(process.env.DATABASE_URL);
  
  console.log('Creating admin user...');
  
  const password = await bcrypt.hash('test123', 12);
  
  const admin = await User.findOneAndUpdate(
    { email: 'test@gmail.com' },
    {
      name: 'Admin User',
      email: 'test@gmail.com',
      password: password,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
    { upsert: true, new: true }
  );
  
  console.log('Admin created:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
