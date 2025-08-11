const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    allowNull: false,
    defaultValue: 'employee',
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  manager: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  leaveBalance: {
    type: DataTypes.JSON,
    defaultValue: {
      annual: 20,
      sick: 10,
      personal: 5,
      maternity: 90,
      paternity: 15
    },
  },
  salary: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  payrollInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

// Define Leave model
const Leave = sequelize.define('Leave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  leaveType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Define Attendance model
const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half-day'),
    defaultValue: 'present',
  },
  workingHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Define Department model
const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Define LeaveType model
const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  maxDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  carryForward: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Define Shift model
const Shift = sequelize.define('Shift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  breakTime: {
    type: DataTypes.INTEGER,
    defaultValue: 60, // in minutes
  },
  totalHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Define Payroll model
const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  allowances: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  deductions: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  grossSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'processed', 'paid'),
    defaultValue: 'draft',
  },
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Define Goal model
const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  setBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Define associations
User.hasMany(Leave, { foreignKey: 'employeeId', as: 'leaves' });
Leave.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrolls' });
Payroll.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(Goal, { foreignKey: 'employeeId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Goal.belongsTo(User, { foreignKey: 'setBy', as: 'setter' });

Department.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: false }); // Changed to false to preserve data
    console.log('Database synchronized successfully.');
    
    // Seed initial data
    await seedInitialData();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    // Check if users already exist
    const userCount = await User.count();
    if (userCount === 0) {
      // Create initial users
      await User.bulkCreate([
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@company.com',
          password: 'password123',
          employeeId: 'EMP001',
          role: 'admin',
          department: 'IT',
          leaveBalance: {
            annual: 20,
            sick: 10,
            personal: 5,
            maternity: 90,
            paternity: 15
          },
          salary: {
            basicSalary: 80000,
            hra: 32000,
            da: 24000,
            ta: 8000,
            pf: 9600,
            tax: 12000,
            performanceIncentive: 10000,
            specialAllowance: 8000,
            medicalAllowance: 5000,
            transportAllowance: 3000
          },
          payrollInfo: {
            bankName: 'HDFC Bank',
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            panNumber: 'ABCDE1234F'
          }
        },
        {
          id: 2,
          firstName: 'Manager',
          lastName: 'User',
          email: 'manager@company.com',
          password: 'password123',
          employeeId: 'EMP002',
          role: 'manager',
          department: 'HR',
          leaveBalance: {
            annual: 18,
            sick: 8,
            personal: 4,
            maternity: 90,
            paternity: 15
          },
          salary: {
            basicSalary: 65000,
            hra: 26000,
            da: 19500,
            ta: 6500,
            pf: 7800,
            tax: 9750,
            performanceIncentive: 7500,
            specialAllowance: 6000,
            medicalAllowance: 4000,
            transportAllowance: 2500
          },
          payrollInfo: {
            bankName: 'HDFC Bank',
            accountNumber: '1234567891',
            ifscCode: 'HDFC0001234',
            panNumber: 'ABCDE1234G'
          }
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'User',
          email: 'employee@company.com',
          password: 'password123',
          employeeId: 'EMP003',
          role: 'employee',
          department: 'Engineering',
          manager: 2,
          leaveBalance: {
            annual: 15,
            sick: 7,
            personal: 3,
            maternity: 90,
            paternity: 15
          },
          salary: {
            basicSalary: 50000,
            hra: 20000,
            da: 15000,
            ta: 5000,
            pf: 6000,
            tax: 8000,
            performanceIncentive: 5000,
            specialAllowance: 4000,
            medicalAllowance: 3000,
            transportAllowance: 2000
          },
          payrollInfo: {
            bankName: 'HDFC Bank',
            accountNumber: '1234567892',
            ifscCode: 'HDFC0001234',
            panNumber: 'ABCDE1234H'
          }
        }
      ]);
      console.log('Initial users created.');
    }

    // Seed departments
    const deptCount = await Department.count();
    if (deptCount === 0) {
      await Department.bulkCreate([
        { name: 'IT', description: 'Information Technology', managerId: 1, isActive: true },
        { name: 'HR', description: 'Human Resources', managerId: 2, isActive: true },
        { name: 'Engineering', description: 'Software Engineering', managerId: 2, isActive: true },
        { name: 'Finance', description: 'Finance and Accounting', managerId: 1, isActive: true },
        { name: 'Marketing', description: 'Marketing and Sales', managerId: 2, isActive: true }
      ]);
      console.log('Initial departments created.');
    }

    // Seed leave types
    const leaveTypeCount = await LeaveType.count();
    if (leaveTypeCount === 0) {
      await LeaveType.bulkCreate([
        { name: 'Annual Leave', code: 'AL', maxDays: 20, carryForward: true, description: 'Annual vacation leave', isActive: true },
        { name: 'Sick Leave', code: 'SL', maxDays: 10, carryForward: false, description: 'Medical leave', isActive: true },
        { name: 'Personal Leave', code: 'PL', maxDays: 5, carryForward: false, description: 'Personal time off', isActive: true },
        { name: 'Maternity Leave', code: 'ML', maxDays: 90, carryForward: false, description: 'Maternity leave', isActive: true },
        { name: 'Paternity Leave', code: 'PTL', maxDays: 15, carryForward: false, description: 'Paternity leave', isActive: true }
      ]);
      console.log('Initial leave types created.');
    }

    // Seed shifts
    const shiftCount = await Shift.count();
    if (shiftCount === 0) {
      await Shift.bulkCreate([
        {
          name: 'Morning Shift',
          startTime: '09:00',
          endTime: '17:00',
          breakTime: 60,
          totalHours: 7,
          description: 'Standard morning shift',
          color: '#3B82F6',
          isActive: true
        },
        {
          name: 'Evening Shift',
          startTime: '17:00',
          endTime: '01:00',
          breakTime: 60,
          totalHours: 7,
          description: 'Evening shift',
          color: '#8B5CF6',
          isActive: true
        },
        {
          name: 'Night Shift',
          startTime: '22:00',
          endTime: '06:00',
          breakTime: 60,
          totalHours: 7,
          description: 'Night shift',
          color: '#1F2937',
          isActive: true
        }
      ]);
      console.log('Initial shifts created.');
    }

  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Leave,
  Attendance,
  Department,
  LeaveType,
  Shift,
  Payroll,
  Goal,
  initializeDatabase
};
