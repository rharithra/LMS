const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
const Department = require('./server/models/Department');

// Connect to MongoDB Atlas (free cloud database)
// You can replace this with your own MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/leave-management?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Create departments
    const departments = [
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Human Resources Department',
        leavePolicies: {
          annual: { defaultDays: 25, maxDays: 30, minNoticeDays: 7 },
          sick: { defaultDays: 15, maxDays: 20, requiresDocumentation: true },
          personal: { defaultDays: 7, maxDays: 10, minNoticeDays: 3 }
        }
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology Department',
        leavePolicies: {
          annual: { defaultDays: 20, maxDays: 25, minNoticeDays: 7 },
          sick: { defaultDays: 10, maxDays: 15, requiresDocumentation: true },
          personal: { defaultDays: 5, maxDays: 8, minNoticeDays: 3 }
        }
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Finance Department',
        leavePolicies: {
          annual: { defaultDays: 22, maxDays: 28, minNoticeDays: 7 },
          sick: { defaultDays: 12, maxDays: 18, requiresDocumentation: true },
          personal: { defaultDays: 6, maxDays: 10, minNoticeDays: 3 }
        }
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing Department',
        leavePolicies: {
          annual: { defaultDays: 20, maxDays: 25, minNoticeDays: 7 },
          sick: { defaultDays: 10, maxDays: 15, requiresDocumentation: true },
          personal: { defaultDays: 5, maxDays: 8, minNoticeDays: 3 }
        }
      }
    ];

    // Clear existing departments
    await Department.deleteMany({});
    
    // Insert departments
    const createdDepartments = await Department.insertMany(departments);
    console.log('Departments created:', createdDepartments.length);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com',
      password: adminPassword,
      employeeId: 'EMP001',
      department: createdDepartments[0]._id, // HR department
      role: 'admin',
      position: 'System Administrator',
      hireDate: new Date(),
      leaveBalance: {
        annual: 25,
        sick: 15,
        personal: 7,
        maternity: 90,
        paternity: 14
      }
    });

    await adminUser.save();
    console.log('Admin user created');

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managerUser = new User({
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@company.com',
      password: managerPassword,
      employeeId: 'EMP002',
      department: createdDepartments[1]._id, // IT department
      role: 'manager',
      position: 'IT Manager',
      hireDate: new Date(),
      leaveBalance: {
        annual: 20,
        sick: 10,
        personal: 5,
        maternity: 90,
        paternity: 14
      }
    });

    await managerUser.save();
    console.log('Manager user created');

    // Create employee user
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employeeUser = new User({
      firstName: 'Employee',
      lastName: 'User',
      email: 'employee@company.com',
      password: employeePassword,
      employeeId: 'EMP003',
      department: createdDepartments[1]._id, // IT department
      role: 'employee',
      manager: managerUser._id,
      position: 'Software Developer',
      hireDate: new Date(),
      leaveBalance: {
        annual: 20,
        sick: 10,
        personal: 5,
        maternity: 90,
        paternity: 14
      }
    });

    await employeeUser.save();
    console.log('Employee user created');

    console.log('\n=== Setup Complete ===');
    console.log('\nDefault users created:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Employee: employee@company.com / employee123');
    console.log('\nYou can now start the application with: npm run dev');

  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\nTo fix this, you need to:');
    console.log('1. Install MongoDB locally, OR');
    console.log('2. Use MongoDB Atlas (free cloud database)');
    console.log('3. Update the MONGODB_URI in setup.js with your connection string');
  } finally {
    mongoose.connection.close();
  }
};

setupDatabase(); 