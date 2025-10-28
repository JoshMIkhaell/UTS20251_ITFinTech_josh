// scripts/createAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup __dirname untuk ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Schema User
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  isAdmin: { type: Boolean, default: false },
  phoneNumber: String,
  otp: { code: String, expiresAt: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    // Koneksi ke MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Data admin yang akan dibuat
    const adminData = {
      name: 'Admin Utama',
      email: 'admin@example.com',
      password: 'admin123', // Password yang akan di-hash
      phoneNumber: '081234567890',
      isAdmin: true
    };

    // Cek apakah admin sudah ada
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin dengan email tersebut sudah ada!');
      console.log('Email:', existingAdmin.email);
      console.log('Nama:', existingAdmin.name);
      console.log('IsAdmin:', existingAdmin.isAdmin);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    console.log('🔄 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminData.password, salt);

    // Buat user admin
    console.log('🔄 Creating admin user...');
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      passwordHash: passwordHash,
      phoneNumber: adminData.phoneNumber,
      isAdmin: true
    });

    console.log('\n✅ Admin berhasil dibuat!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email    :', adminData.email);
    console.log('🔑 Password :', adminData.password);
    console.log('👤 Nama     :', admin.name);
    console.log('📱 Phone    :', admin.phoneNumber);
    console.log('═══════════════════════════════════════');
    console.log('⚠️  SIMPAN KREDENSIAL INI!');
    console.log('Gunakan untuk login ke /admin/login\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Jalankan fungsi
createAdmin();