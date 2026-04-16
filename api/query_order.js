const mongoose = require('mongoose');
const Order = require('./dist/models/Order').default;

const uri = "mongodb+srv://damian:wJwxO0xQYgrLV9AH@altoev.u9lcgej.mongodb.net/lanforge-final?retryWrites=true&w=majority&appName=Altoev";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const order = await Order.findById('69dd99f9f5b11356dd2e7c60');
    if (order) {
      console.log(`http://localhost:3000/order-status?orderNumber=${order.orderNumber}&email=${encodeURIComponent(order.shippingAddress.email)}`);
    } else {
      console.log('Order not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
