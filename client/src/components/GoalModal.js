import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const GoalModal = ({ isOpen, onClose, users }) => {
  const { user } = useAuth();
  
  console.log('Current user in GoalModal:', user);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    startDate: '',
    endDate: '',
    priority: 'medium'
  });

  const queryClient = useQueryClient();

  const addGoalMutation = useMutation(
    (data) => {
      console.log('Sending goal data:', data);
      return api.post('/api/performance-goals', data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('performanceGoals');
        toast.success('Performance goal added successfully!');
        onClose();
        resetForm();
      },
      onError: (error) => {
        console.error('Goal creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to add goal');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      employeeId: '',
      title: '',
      description: '',
      category: '',
      targetValue: '',
      currentValue: '',
      unit: '',
      startDate: '',
      endDate: '',
      priority: 'medium'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.title || !formData.targetValue || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    // Test API connection first
    api.get('/api/test')
      .then(() => {
        console.log('API connection successful');
        addGoalMutation.mutate(formData);
      })
      .catch((error) => {
        console.error('API connection failed:', error);
        toast.error('Cannot connect to server. Please try again.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FlagIcon className="h-5 w-5 mr-2" />
            Add Performance Goal
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Debug Test Button */}
          <div className="mb-4 p-3 bg-yellow-100 rounded">
            <button
              type="button"
              onClick={() => {
                console.log('Testing API connection...');
                api.get('/api/test')
                  .then(res => {
                    console.log('API test successful:', res.data);
                    toast.success('API connection working!');
                  })
                  .catch(err => {
                    console.error('API test failed:', err);
                    toast.error('API connection failed!');
                  });
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Test API Connection
            </button>
            <span className="ml-2 text-sm text-gray-600">
              Current user: {user?.role || 'Unknown'}
            </span>
          </div>
          
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
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

          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Increase Sales by 20%"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the goal in detail..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Sales">Sales</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Project Management">Project Management</option>
                <option value="Leadership">Leadership</option>
                <option value="Personal Development">Personal Development</option>
                <option value="Technical Skills">Technical Skills</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Target and Current Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                name="targetValue"
                value={formData.targetValue}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="number"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Unit</option>
                <option value="percentage">Percentage (%)</option>
                <option value="number">Number</option>
                <option value="currency">Currency (₹)</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="score">Score</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
              disabled={addGoalMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {addGoalMutation.isLoading ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal; 