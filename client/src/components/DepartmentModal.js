import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const DepartmentModal = ({ department, isOpen, onClose, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    managerId: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch managers for dropdown
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery('users', async () => {
    const response = await api.get('/api/users');
    // Backend returns { users: [...] }, so we need to extract the users array
    return response.data.users || response.data;
  }, {
    retry: 3,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Failed to fetch users:', error);
    }
  });

  // Ensure users is always an array before filtering
  const managers = Array.isArray(users) 
    ? users.filter(user => user.role === 'manager' || user.role === 'admin') 
    : [];

  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        managerId: department.managerId || '',
        isActive: department.isActive !== undefined ? department.isActive : true
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        managerId: '',
        isActive: true
      });
    }
  }, [department, mode]);

  const mutation = useMutation(
    async (data) => {
      if (mode === 'edit') {
        const response = await api.put(`/api/departments/${department.id}`, data);
        return response.data;
      } else {
        const response = await api.post('/api/departments', data);
        return response.data;
      }
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('departments');
        const successMessage = response.data?.message || `Department ${mode === 'edit' ? 'updated' : 'created'} successfully!`;
        toast.success(successMessage);
        onClose();
      },
      onError: (error) => {
        const errorData = error.response?.data;
        let errorMessage = `Failed to ${mode} department`;
        
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          switch (errorData.error) {
            case 'DUPLICATE_NAME':
              errorMessage = 'A department with this name already exists';
              break;
            case 'DUPLICATE_CODE':
              errorMessage = 'A department with this code already exists';
              break;
            case 'VALIDATION_ERROR':
              errorMessage = `Invalid ${errorData.field}: ${errorData.message}`;
              break;
            case 'INSUFFICIENT_PERMISSIONS':
              errorMessage = 'You don\'t have permission to perform this action';
              break;
            default:
              errorMessage = errorData.message || errorMessage;
          }
        }
        
        toast.error(errorMessage);
        console.error('Department operation error:', errorData);
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = {
      ...formData,
      code: formData.code.toUpperCase()
    };

    mutation.mutate(submitData);
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'managerId' ? (value === '' ? null : parseInt(value)) : value)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {mode === 'edit' ? 'Edit Department' : 'Add New Department'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Human Resources"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., HR"
                required
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Department description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Manager
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading 
                    ? "Loading managers..." 
                    : usersError 
                    ? "Error loading managers" 
                    : "Select a manager (optional)"
                  }
                </option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} ({manager.role})
                  </option>
                ))}
              </select>
              {usersError && (
                <p className="mt-1 text-sm text-red-600">
                  Failed to load managers. You can still create the department without selecting a manager.
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Department
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal; 