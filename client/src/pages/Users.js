import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import UserModal from '../components/UserModal';
import SalaryModal from '../components/SalaryModal';
import BulkSalarySetup from '../components/BulkSalarySetup';
import toast from 'react-hot-toast';

const Users = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showBulkSalaryModal, setShowBulkSalaryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery('users', () =>
    api.get('/api/users').then(res => res.data)
  );

  const { data: departmentsData } = useQuery('departments', () =>
    api.get('/api/departments').then(res => res.data)
  );

  const { data: managersData } = useQuery('managers', () =>
    api.get('/api/users').then(res => res.data)
  );

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleEditSalary = (user) => {
    setSelectedUser(user);
    setShowSalaryModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage employees and their information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkSalaryModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CurrencyDollarIcon className="h-5 w-5" />
            Bulk Salary Setup
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData?.users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.salary?.netSalary || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleEditSalary(user)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Salary
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        departments={departmentsData}
        managers={managersData?.users?.filter(u => u.role === 'manager')}
        onSuccess={() => {
          queryClient.invalidateQueries('users');
          setEditingUser(null);
        }}
      />

      {/* Salary Modal */}
      <SalaryModal
        isOpen={showSalaryModal}
        onClose={() => {
          setShowSalaryModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          queryClient.invalidateQueries('users');
          setSelectedUser(null);
        }}
      />

      {/* Bulk Salary Setup Modal */}
      <BulkSalarySetup
        isOpen={showBulkSalaryModal}
        onClose={() => setShowBulkSalaryModal(false)}
        users={usersData?.users || []}
        onSuccess={() => {
          queryClient.invalidateQueries('users');
        }}
      />
    </div>
  );
};

export default Users; 