import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const BulkSalarySetup = ({ isOpen, onClose, users, onSuccess }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [salaryTemplate, setSalaryTemplate] = useState({
    basicSalary: 50000,
    hra: 20000,
    da: 15000,
    ta: 5000,
    pf: 6000,
    tax: 8000,
    performanceIncentive: 0,
    specialAllowance: 5000,
    medicalAllowance: 3000,
    conveyanceAllowance: 2000,
    foodAllowance: 1500,
    otherAllowances: 0
  });

  const queryClient = useQueryClient();

  const updateSalaryMutation = useMutation(
    async (data) => {
      const promises = data.users.map(userId => 
        api.put(`/api/users/${userId}/salary`, data.salary)
      );
      await Promise.all(promises);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success(`Salary updated for ${selectedUsers.length} employees!`);
        onSuccess?.();
        onClose();
        setSelectedUsers([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update salaries');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    updateSalaryMutation.mutate({
      users: selectedUsers,
      salary: salaryTemplate
    });
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setSalaryTemplate(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateTotal = () => {
    const allowances = salaryTemplate.hra + salaryTemplate.da + salaryTemplate.ta + 
                     salaryTemplate.performanceIncentive + salaryTemplate.specialAllowance + 
                     salaryTemplate.medicalAllowance + salaryTemplate.conveyanceAllowance + 
                     salaryTemplate.foodAllowance + salaryTemplate.otherAllowances;
    const deductions = salaryTemplate.pf + salaryTemplate.tax;
    return {
      grossSalary: salaryTemplate.basicSalary + allowances,
      netSalary: salaryTemplate.basicSalary + allowances - deductions,
      totalAllowances: allowances,
      totalDeductions: deductions
    };
  };

  const totals = calculateTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Bulk Salary Setup
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Select Employees</h4>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName} ({user.role})
                  </span>
                </label>
              ))}
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Selected: {selectedUsers.length} employees
            </p>
          </div>

          {/* Salary Template */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Salary Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={salaryTemplate.basicSalary}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HRA
                </label>
                <input
                  type="number"
                  name="hra"
                  value={salaryTemplate.hra}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA
                </label>
                <input
                  type="number"
                  name="da"
                  value={salaryTemplate.da}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TA
                </label>
                <input
                  type="number"
                  name="ta"
                  value={salaryTemplate.ta}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PF
                </label>
                <input
                  type="number"
                  name="pf"
                  value={salaryTemplate.pf}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax
                </label>
                <input
                  type="number"
                  name="tax"
                  value={salaryTemplate.tax}
                  onChange={handleTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Template Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Basic Salary</div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{salaryTemplate.basicSalary.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Allowances</div>
                <div className="text-lg font-bold text-green-600">
                  ₹{totals.totalAllowances.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Deductions</div>
                <div className="text-lg font-bold text-red-600">
                  ₹{totals.totalDeductions.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Net Salary</div>
                <div className="text-lg font-bold text-purple-600">
                  ₹{totals.netSalary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSalaryMutation.isLoading || selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updateSalaryMutation.isLoading ? 'Updating...' : `Update ${selectedUsers.length} Employees`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkSalarySetup; 