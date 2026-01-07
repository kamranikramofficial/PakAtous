const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const order = await mongoose.connection.db.collection('orders').findOne({ 
      orderNumber: 'ORD-MJR97ZTF-VI8U' 
    });
    
    if (order) {
      console.log('Order found!');
      console.log('Items count:', order.items?.length || 0);
      console.log('Items:', JSON.stringify(order.items, null, 2));
    } else {
      console.log('Order not found');
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
