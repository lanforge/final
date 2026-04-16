const mongoose = require('mongoose');
const Order = require('./api/dist/models/Order').default;

mongoose.connect('mongodb://localhost:27017/lanforge', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const order = await Order.findById('69dd99f9f5b11356dd2e7c60');
    console.log(order);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
