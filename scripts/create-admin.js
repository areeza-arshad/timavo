// scripts/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://timavoofficial_db_user:u0rEwoPh460vssZb@cluster0.gaaxij5.mongodb.net/timavo?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);

    const adminEmail = 'admin@timavo.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();