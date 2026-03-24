import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
  isActive: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to DB');

    const email = 'admin@lanforge.com';
    const password = 'Admin@LANForge2026!';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      existingAdmin.password = await bcrypt.hash(password, 12);
      await existingAdmin.save();
      console.log('Password updated successfully!');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
