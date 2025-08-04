import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const PromotionModal = ({ isOpen, onClose, users }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    fromPosition: '',
    toPosition: '',
    effectiveDate: '',
    salaryIncrease: '',
    reason: ''
  });

  const queryClient = useQueryClient();

  const addPromotionMutation = useMutation(
    (data) => api.post('/api/promotions', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('promotions');
        queryClient.invalidateQueries('users');
        toast.success('Promotion added successfully!');
        onClose();
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add promotion');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      employeeId: '',
      fromPosition: '',
      toPosition: '',
      effectiveDate: '',
      salaryIncrease: '',
      reason: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.fromPosition || !formData.toPosition || !formData.effectiveDate || !formData.salaryIncrease || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    addPromotionMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    const selectedEmployee = users?.find(u => u.id === parseInt(employeeId));
    
    setFormData(prev => ({
      ...prev,
      employeeId,
      fromPosition: selectedEmployee?.position || selectedEmployee?.role || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Promotion
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleEmployeeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Employee</option>
              {users?.filter(u => u.role === 'employee').map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.department}
                </option>
              ))}
            </select>
          </div>

          {/* Position Change */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Position *
              </label>
              <input
                type="text"
                name="fromPosition"
                value={formData.fromPosition}
                onChange={handleChange}
                placeholder="e.g., Sales Executive"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Position *
              </label>
              <input
                type="text"
                name="toPosition"
                value={formData.toPosition}
                onChange={handleChange}
                placeholder="e.g., Senior Sales Executive"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Effective Date and Salary Increase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Increase (₹) *
              </label>
              <input
                type="number"
                name="salaryIncrease"
                value={formData.salaryIncrease}
                onChange={handleChange}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Promotion *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Describe the reason for this promotion..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Promotion Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Position Change:</span>
                <div className="font-medium">
                  {formData.fromPosition} → {formData.toPosition}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Salary Increase:</span>
                <div className="font-medium text-green-600">
                  ₹{formData.salaryIncrease ? parseInt(formData.salaryIncrease).toLocaleString() : '0'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPromotionMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {addPromotionMutation.isLoading ? 'Adding...' : 'Add Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionModal; 