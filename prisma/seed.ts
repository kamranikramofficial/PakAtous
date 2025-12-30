import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import { User } from '../src/models/User';
import { GeneratorCategory, Generator } from '../src/models/Generator';
import { PartCategory, Part } from '../src/models/Part';
import { Brand } from '../src/models/Brand';
import { Setting } from '../src/models/Setting';

async function main() {
  console.log('🌱 Starting database seed...');

  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Create Admin User
  const adminPassword = await bcrypt.hash('test123', 12);
  const admin = await User.findOneAndUpdate(
    { email: 'test@gmail.com' },
    {
      name: 'Admin User',
      email: 'test@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
      phone: '+92-300-1234567',
    },
    { upsert: true, new: true }
  );
  console.log('✅ Admin user created:', admin.email);

  // Create Test User
  const userPassword = await bcrypt.hash('User@123456', 12);
  const user = await User.findOneAndUpdate(
    { email: 'user@example.com' },
    {
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: new Date(),
      phone: '+92-300-9876543',
    },
    { upsert: true, new: true }
  );
  console.log('✅ Test user created:', user.email);

  // Create Generator Categories
  const categories = await Promise.all([
    GeneratorCategory.findOneAndUpdate(
      { slug: 'portable-generators' },
      {
        name: 'Portable Generators',
        slug: 'portable-generators',
        description: 'Compact and portable generators for home and outdoor use',
      },
      { upsert: true, new: true }
    ),
    GeneratorCategory.findOneAndUpdate(
      { slug: 'industrial-generators' },
      {
        name: 'Industrial Generators',
        slug: 'industrial-generators',
        description: 'Heavy-duty generators for industrial and commercial applications',
      },
      { upsert: true, new: true }
    ),
    GeneratorCategory.findOneAndUpdate(
      { slug: 'home-standby-generators' },
      {
        name: 'Home Standby Generators',
        slug: 'home-standby-generators',
        description: 'Automatic backup power for your home',
      },
      { upsert: true, new: true }
    ),
  ]);
  console.log('✅ Generator categories created');

  // Create Part Categories
  const partCategories = await Promise.all([
    PartCategory.findOneAndUpdate(
      { slug: 'filters' },
      {
        name: 'Filters',
        slug: 'filters',
        description: 'Air, oil, and fuel filters for generators',
      },
      { upsert: true, new: true }
    ),
    PartCategory.findOneAndUpdate(
      { slug: 'spark-plugs' },
      {
        name: 'Spark Plugs',
        slug: 'spark-plugs',
        description: 'High-quality spark plugs for optimal performance',
      },
      { upsert: true, new: true }
    ),
    PartCategory.findOneAndUpdate(
      { slug: 'batteries' },
      {
        name: 'Batteries',
        slug: 'batteries',
        description: 'Starter batteries and battery accessories',
      },
      { upsert: true, new: true }
    ),
    PartCategory.findOneAndUpdate(
      { slug: 'fuel-system' },
      {
        name: 'Fuel System',
        slug: 'fuel-system',
        description: 'Fuel pumps, lines, and related components',
      },
      { upsert: true, new: true }
    ),
  ]);
  console.log('✅ Part categories created');

  // Create Brands
  await Promise.all([
    Brand.findOneAndUpdate(
      { slug: 'honda' },
      { name: 'Honda', slug: 'honda', isActive: true },
      { upsert: true, new: true }
    ),
    Brand.findOneAndUpdate(
      { slug: 'yamaha' },
      { name: 'Yamaha', slug: 'yamaha', isActive: true },
      { upsert: true, new: true }
    ),
    Brand.findOneAndUpdate(
      { slug: 'caterpillar' },
      { name: 'Caterpillar', slug: 'caterpillar', isActive: true },
      { upsert: true, new: true }
    ),
    Brand.findOneAndUpdate(
      { slug: 'cummins' },
      { name: 'Cummins', slug: 'cummins', isActive: true },
      { upsert: true, new: true }
    ),
    Brand.findOneAndUpdate(
      { slug: 'perkins' },
      { name: 'Perkins', slug: 'perkins', isActive: true },
      { upsert: true, new: true }
    ),
  ]);
  console.log('✅ Brands created');

  // Create Sample Generators
  await Promise.all([
    Generator.findOneAndUpdate(
      { slug: 'honda-eu3000is-portable' },
      {
        name: 'Honda EU3000iS Super Quiet Portable Generator',
        slug: 'honda-eu3000is-portable',
        description: 'The Honda EU3000iS is an inverter generator that offers 3000 watts of power with super quiet operation. Perfect for home backup, RV, and outdoor activities.',
        shortDescription: 'Super quiet 3000W inverter generator',
        powerKva: 3.0,
        powerKw: 2.8,
        fuelType: 'PETROL',
        brand: 'Honda',
        model: 'EU3000iS',
        condition: 'NEW',
        price: 285000,
        compareAtPrice: 310000,
        stock: 15,
        sku: 'HON-EU3000IS',
        warranty: '3 Years',
        weight: 60,
        voltage: '220V',
        frequency: '50Hz',
        phase: 'Single Phase',
        tankCapacity: 13.3,
        runtime: '20 hours at 25% load',
        isActive: true,
        isFeatured: true,
        categoryId: categories[0]._id,
      },
      { upsert: true, new: true }
    ),
    Generator.findOneAndUpdate(
      { slug: 'caterpillar-c18-industrial' },
      {
        name: 'Caterpillar C18 500kVA Industrial Generator',
        slug: 'caterpillar-c18-industrial',
        description: 'The Cat C18 diesel generator set is a reliable, heavy-duty power solution for industrial applications. Features superior fuel efficiency and durability.',
        shortDescription: '500kVA industrial diesel generator',
        powerKva: 500,
        powerKw: 400,
        fuelType: 'DIESEL',
        brand: 'Caterpillar',
        model: 'C18',
        condition: 'NEW',
        price: 8500000,
        stock: 3,
        sku: 'CAT-C18-500',
        warranty: '2 Years',
        weight: 4500,
        voltage: '380V/220V',
        frequency: '50Hz',
        phase: 'Three Phase',
        tankCapacity: 1000,
        isActive: true,
        isFeatured: true,
        categoryId: categories[1]._id,
      },
      { upsert: true, new: true }
    ),
  ]);
  console.log('✅ Sample generators created');

  // Create Sample Parts
  await Promise.all([
    Part.findOneAndUpdate(
      { slug: 'honda-air-filter-17210-z4m-821' },
      {
        name: 'Honda Air Filter 17210-Z4M-821',
        slug: 'honda-air-filter-17210-z4m-821',
        description: 'Genuine Honda air filter for EU series generators. Ensures clean air intake for optimal engine performance.',
        shortDescription: 'Genuine Honda air filter',
        price: 2500,
        stock: 50,
        sku: 'HON-AF-17210',
        partNumber: '17210-Z4M-821',
        brand: 'Honda',
        compatibility: 'Honda EU2000i, EU2200i, EU3000iS',
        isActive: true,
        categoryId: partCategories[0]._id,
      },
      { upsert: true, new: true }
    ),
    Part.findOneAndUpdate(
      { slug: 'ngk-spark-plug-bpr6es' },
      {
        name: 'NGK Spark Plug BPR6ES',
        slug: 'ngk-spark-plug-bpr6es',
        description: 'Premium NGK spark plug for reliable ignition. Compatible with most small engine generators.',
        shortDescription: 'Premium NGK spark plug',
        price: 450,
        stock: 200,
        sku: 'NGK-BPR6ES',
        partNumber: 'BPR6ES',
        brand: 'NGK',
        compatibility: 'Most Honda, Yamaha, and generic petrol generators',
        isActive: true,
        categoryId: partCategories[1]._id,
      },
      { upsert: true, new: true }
    ),
  ]);
  console.log('✅ Sample parts created');

  // Create Default Settings
  const settings = [
    { key: 'site_name', value: 'PakAutoSe Generators', group: 'general' },
    { key: 'site_description', value: 'Your trusted source for generators, parts, and services', group: 'general' },
    { key: 'contact_email', value: 'contact@pakautose.com', group: 'general' },
    { key: 'contact_phone', value: '+92-42-1234567', group: 'general' },
    { key: 'address', value: 'Karachi, Pakistan', group: 'general' },
    { key: 'currency', value: 'PKR', group: 'general' },
    { key: 'currency_symbol', value: 'Rs.', group: 'general' },
    { key: 'shipping_cost_default', value: '500', type: 'number', group: 'shipping' },
    { key: 'free_shipping_threshold', value: '50000', type: 'number', group: 'shipping' },
    { key: 'cod_enabled', value: 'true', type: 'boolean', group: 'payment' },
    { key: 'stripe_enabled', value: 'true', type: 'boolean', group: 'payment' },
    { key: 'tax_rate', value: '0', type: 'number', group: 'payment' },
  ];

  for (const setting of settings) {
    await Setting.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Default settings created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
