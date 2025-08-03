import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon as ExclamationIcon,
  PlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LeaveNotification from '../components/LeaveNotification';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery('dashboard', async () => {
    const [leavesResponse, statsResponse] = await Promise.all([
      axios.get('/api/leaves?limit=5'),
      axios.get('/api/leaves/stats')
    ]);
    
    return {
      recentLeaves: leavesResponse.data.leaves,
      stats: statsResponse.data
    };
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ExclamationIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-cancelled';
    }
  };

  const { data: leaveTypesData } = useQuery('leaveTypes', async () => {
    const response = await axios.get('/api/leave-types');
    return response.data;
  });

  const leaveTypes = leaveTypesData?.map(lt => ({
    key: lt.code,
    label: lt.name,
    color: `bg-${lt.color}-500`,
    defaultDays: lt.defaultDays
  })) || [
    { key: 'annual', label: 'Annual Leave', color: 'bg-blue-500', defaultDays: 20 },
    { key: 'sick', label: 'Sick Leave', color: 'bg-red-500', defaultDays: 10 },
    { key: 'personal', label: 'Personal Leave', color: 'bg-green-500', defaultDays: 5 },
    { key: 'maternity', label: 'Maternity Leave', color: 'bg-purple-500', defaultDays: 90 },
    { key: 'paternity', label: 'Paternity Leave', color: 'bg-indigo-500', defaultDays: 14 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName}! Here's what's happening with your leave requests.
        </p>
      </div>

      {/* Leave Notifications */}
      <LeaveNotification user={user} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/new-leave-request"
          className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlusIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">New Request</h3>
              <p className="text-sm text-gray-500">Submit a leave request</p>
            </div>
          </div>
        </Link>

        <Link
          to="/leave-requests"
          className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">View Requests</h3>
              <p className="text-sm text-gray-500">Check your leave history</p>
            </div>
          </div>
        </Link>

        {(user?.role === 'manager' || user?.role === 'admin') && (
          <Link
            to="/users"
            className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Team</h3>
                <p className="text-sm text-gray-500">View team requests</p>
              </div>
            </div>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link
            to="/departments"
            className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Departments</h3>
                <p className="text-sm text-gray-500">Manage departments</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Leave Balance */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Leave Balance</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {leaveTypes.map((type) => {
            const currentBalance = user?.leaveBalance?.[type.key] || 0;
            const defaultDays = type.defaultDays || 20; // Default allocation
            const usedDays = defaultDays - currentBalance;
            const isLow = currentBalance <= 5;
            const isZero = currentBalance === 0;
            
            return (
              <div key={type.key} className="text-center">
                <div className={`w-12 h-12 rounded-full ${type.color} mx-auto mb-2 flex items-center justify-center ${isZero ? 'opacity-50' : ''}`}>
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-600">{type.label}</p>
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

      {/* Recent Leave Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Leave Requests</h2>
          <Link
            to="/leave-requests"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        {dashboardData?.recentLeaves?.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentLeaves.map((leave) => (
              <div
                key={leave._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(leave.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getStatusClass(leave.status)}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                  <Link
                    to={`/leave-requests/${leave._id}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests yet</p>
            <Link
              to="/new-leave-request"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Submit your first request
            </Link>
          </div>
        )}
      </div>

      {/* Statistics */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.total}</p>
          </div>
          <div className="card text-center">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{dashboardData.stats.pending}</p>
          </div>
          <div className="card text-center">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{dashboardData.stats.approved}</p>
          </div>
          <div className="card text-center">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{dashboardData.stats.rejected}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 