import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const GoalUpdateModal = ({ isOpen, onClose, goal }) => {
  const [formData, setFormData] = useState({
    currentValue: goal?.currentValue || 0,
    status: goal?.status || 'in-progress'
  });

  const queryClient = useQueryClient();

  const updateGoalMutation = useMutation(
    (data) => api.put(`/api/performance-goals/${goal.id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('performanceGoals');
        toast.success('Goal progress updated successfully!');
        onClose();
      },
      onError: (error) => {
        console.error('Goal update error:', error);
        toast.error(error.response?.data?.message || 'Failed to update goal');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.currentValue < 0) {
      toast.error('Current value cannot be negative');
      return;
    }

    updateGoalMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen || !goal) return null;

  const progress = (formData.currentValue / goal.targetValue) * 100;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FlagIcon className="h-5 w-5 mr-2" />
            Update Goal Progress
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{goal.title}</h4>
          {goal.description && (
            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
          )}
          <div className="text-sm text-gray-500">
            <p>Target: {goal.targetValue} {goal.unit}</p>
            <p>Category: {goal.category || 'Not specified'}</p>
            <p>Priority: {goal.priority}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Progress ({goal.unit})
            </label>
            <input
              type="number"
              name="currentValue"
              value={formData.currentValue}
              onChange={handleChange}
              min="0"
              max={goal.targetValue * 2} // Allow some overflow
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  progress >= 100 ? 'bg-green-500' :
                  progress >= 75 ? 'bg-blue-500' :
                  progress >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
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
              disabled={updateGoalMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updateGoalMutation.isLoading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalUpdateModal; 