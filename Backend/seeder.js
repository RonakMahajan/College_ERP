const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Institution = require('./models/Institution');
const Campus = require('./models/Campus');
const Department = require('./models/Department');
const Program = require('./models/Program');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(), Institution.deleteMany(), Campus.deleteMany(),
      Department.deleteMany(), Program.deleteMany()
    ]);

    // Create Users
    const admin = await User.create({ name: 'Super Admin', email: 'admin@erp.com', password: 'admin123', role: 'admin' });
    await User.create({ name: 'Admission Officer', email: 'officer@erp.com', password: 'officer123', role: 'admission_officer' });
    await User.create({ name: 'Management User', email: 'mgmt@erp.com', password: 'mgmt123', role: 'management' });

    // Create Institution
    const institution = await Institution.create({ name: 'ABC Engineering College', code: 'ABCEC', address: 'Bengaluru, Karnataka', phone: '080-12345678' });

    // Create Campus
    const campus = await Campus.create({ name: 'Main Campus', institution: institution._id, location: 'Bengaluru' });

    // Create Departments
    const cse = await Department.create({ name: 'Computer Science & Engineering', campus: campus._id, code: 'CSE' });
    const ece = await Department.create({ name: 'Electronics & Communication', campus: campus._id, code: 'ECE' });
    const mech = await Department.create({ name: 'Mechanical Engineering', campus: campus._id, code: 'MECH' });

    // Create Programs with Quotas
    await Program.create({
      name: 'B.E. Computer Science', code: 'CSE', department: cse._id,
      courseType: 'UG', entryType: 'Regular', admissionMode: 'Government',
      academicYear: '2026-27', intake: 60,
      quotas: [
        { name: 'KCET', seats: 30, filled: 8 },
        { name: 'COMEDK', seats: 15, filled: 4 },
        { name: 'Management', seats: 15, filled: 3 }
      ]
    });

    await Program.create({
      name: 'B.E. Electronics & Communication', code: 'ECE', department: ece._id,
      courseType: 'UG', entryType: 'Regular', admissionMode: 'Government',
      academicYear: '2026-27', intake: 60,
      quotas: [
        { name: 'KCET', seats: 30, filled: 5 },
        { name: 'COMEDK', seats: 15, filled: 2 },
        { name: 'Management', seats: 15, filled: 1 }
      ]
    });

    await Program.create({
      name: 'B.E. Mechanical Engineering', code: 'MECH', department: mech._id,
      courseType: 'UG', entryType: 'Regular', admissionMode: 'Government',
      academicYear: '2026-27', intake: 60,
      quotas: [
        { name: 'KCET', seats: 40, filled: 12 },
        { name: 'Management', seats: 20, filled: 4 }
      ]
    });

    console.log('✅ Seed data created!');
    console.log('Admin: admin@erp.com / admin123');
    console.log('Officer: officer@erp.com / officer123');
    console.log('Management: mgmt@erp.com / mgmt123');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  }
};

seed();
