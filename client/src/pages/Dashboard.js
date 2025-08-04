import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import LeaveNotification from '../components/LeaveNotification';
import GoalUpdateModal from '../components/GoalUpdateModal';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const { data: leaveStats } = useQuery('leaveStats', () =>
    api.get('/api/leaves/stats').then(res => res.data)
  );

  const { data: payrollStats } = useQuery('payrollStats', () =>
    api.get('/api/payroll/stats').then(res => res.data)
  );

  const { data: leaveTypes } = useQuery('leaveTypes', () =>
    api.get('/api/leave-types').then(res => res.data)
  );

  const { data: performanceGoals } = useQuery('performanceGoals', () =>
    api.get('/api/performance-goals').then(res => res.data)
  );

  const { data: attendanceStats } = useQuery('attendanceStats', () =>
    api.get('/api/attendance/stats').then(res => res.data)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-green-100 text-green-800',
      maternity: 'bg-purple-100 text-purple-800',
      paternity: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateGoal = (goal) => {
    setSelectedGoal(goal);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedGoal(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Leave Notification */}
      <LeaveNotification />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveStats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveStats?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveStats?.approved || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveStats?.rejected || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Stats (for managers and admins) */}
      {(user?.role === 'manager' || user?.role === 'admin') && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Payroll Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payrollStats?.totalPayrolls || 0}
                </div>
                <div className="text-sm text-gray-600">Total Payrolls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {payrollStats?.currentMonthPayrolls || 0}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(payrollStats?.totalSalaryPaid || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(payrollStats?.averageSalary || 0)}
                </div>
                <div className="text-sm text-gray-600">Avg Salary</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Attendance Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceStats?.totalDays || 0}
              </div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendanceStats?.present || 0}
              </div>
              <div className="text-sm text-gray-600">Present Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceStats?.late || 0}
              </div>
              <div className="text-sm text-gray-600">Late Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {attendanceStats?.totalOvertime || 0}
              </div>
              <div className="text-sm text-gray-600">Overtime Hours</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {attendanceStats?.totalHours || 0} hrs
              </div>
              <div className="text-sm text-gray-600">Total Hours Worked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {attendanceStats?.totalLateMinutes || 0} min
              </div>
              <div className="text-sm text-gray-600">Total Late Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {attendanceStats?.totalEarlyLeaveMinutes || 0} min
              </div>
              <div className="text-sm text-gray-600">Early Leave Minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leave Balance</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {leaveTypes?.map((type) => {
              const currentBalance = user?.leaveBalance?.[type.code] || 0;
              const defaultDays = type.defaultDays || 20;
              const usedDays = defaultDays - currentBalance;
              const isLow = currentBalance <= 5;
              const isZero = currentBalance === 0;

              return (
                <div key={type.code} className="text-center">
                  <div className={`w-12 h-12 rounded-full ${getLeaveTypeColor(type.code)} mx-auto mb-2 flex items-center justify-center ${isZero ? 'opacity-50' : ''}`}>
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600">{type.name}</p>
                  <p className={`text-xl font-bold ${isZero ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {currentBalance}/{defaultDays}
                  </p>
                  <p className="text-xs text-gray-500">days remaining</p>
                  {usedDays > 0 && (
                    <p className="text-xs text-blue-600 mt-1">Used: {usedDays} days</p>
                  )}
                  {isZero && (
                    <p className="text-xs text-red-500 mt-1">No balance left</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Goals */}
      {performanceGoals && performanceGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FlagIcon className="h-5 w-5 mr-2" />
              My Performance Goals
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {performanceGoals.map((goal) => {
                const progress = (goal.currentValue / goal.targetValue) * 100;
                const isCompleted = goal.status === 'completed';
                const isOverdue = new Date(goal.endDate) < new Date() && !isCompleted;
                
                return (
                  <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Category: {goal.category || 'Not specified'}</span>
                          <span>Priority: {goal.priority}</span>
                          <span>Unit: {goal.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isCompleted ? 'bg-green-100 text-green-800' :
                          isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            isCompleted ? 'bg-green-500' :
                            isOverdue ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(goal.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Update Progress Button for Employees */}
                      {user?.role === 'employee' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                     <button
                             onClick={() => {
                               // For now, just show an alert - we'll implement the modal later
                               alert('Update functionality coming soon!');
                             }}
                             className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                           >
                             Update Progress
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/new-leave-request'}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">New Leave Request</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/leave-requests'}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <CheckCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Leave Requests</p>
            </button>

            {(user?.role === 'manager' || user?.role === 'admin') && (
              <button
                onClick={() => window.location.href = '/payroll'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Manage Payroll</p>
              </button>
            )}

            {user?.role === 'employee' && performanceGoals && performanceGoals.length > 0 && (
              <button
                onClick={() => window.location.href = '/performance'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <FlagIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">View Performance Goals</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 