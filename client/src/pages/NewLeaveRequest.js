import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const NewLeaveRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'bereavement', label: 'Bereavement Leave' },
    { value: 'other', label: 'Other' }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Calculate duration
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Check leave balance
      const currentBalance = user?.leaveBalance?.[data.leaveType] || 0;
      const leaveTypeData = leaveTypes.find(lt => lt.value === data.leaveType);
      const defaultDays = leaveTypeData?.defaultDays || 20;
      
      if (currentBalance < diffDays) {
        toast.error(`Insufficient leave balance. You have ${currentBalance}/${defaultDays} days remaining for ${data.leaveType} leave.`);
        setIsSubmitting(false);
        return;
      }

      const leaveData = {
        ...data,
        duration: diffDays
      };

      await axios.post('/api/leaves', leaveData);
      toast.success('Leave request submitted successfully! Your manager will be notified.', {
        icon: '📧',
        duration: 5000
      });
      navigate('/leave-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Leave Request</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit a new leave request for approval.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
              Leave Type
            </label>
            <select
              id="leaveType"
              {...register('leaveType', { required: 'Leave type is required' })}
              className={`mt-1 input-field ${errors.leaveType ? 'border-red-500' : ''}`}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                {...register('startDate', { required: 'Start date is required' })}
                className={`mt-1 input-field ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: value => {
                    if (startDate && value < startDate) {
                      return 'End date cannot be before start date';
                    }
                    return true;
                  }
                })}
                className={`mt-1 input-field ${errors.endDate ? 'border-red-500' : ''}`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {startDate && endDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Duration: {(() => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const diffTime = Math.abs(end - start);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  return `${diffDays} day(s)`;
                })()}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              id="reason"
              rows={4}
              {...register('reason', { 
                required: 'Reason is required',
                minLength: { value: 10, message: 'Reason must be at least 10 characters' }
              })}
              className={`mt-1 input-field ${errors.reason ? 'border-red-500' : ''}`}
              placeholder="Please provide a detailed reason for your leave request..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/leave-requests')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeaveRequest; 