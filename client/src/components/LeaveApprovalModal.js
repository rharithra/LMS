import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const LeaveApprovalModal = ({ leave, isOpen, onClose, onApproved }) => {
  const [status, setStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation(
    async ({ id, approvalData }) => {
      const response = await api.put(`/api/leaves/${id}/approve`, approvalData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leaves');
        toast.success('Leave request processed successfully!');
        onApproved();
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process leave request');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const approvalData = {
      status,
      ...(status === 'rejected' && { rejectionReason })
    };

    approveMutation.mutate({ id: leave.id, approvalData });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Process Leave Request
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Employee:</strong> {leave.employee?.firstName} {leave.employee?.lastName}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Leave Type:</strong> {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Duration:</strong> {leave.duration} day(s)
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Reason:</strong> {leave.reason}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approved"
                    checked={status === 'approved'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="rejected"
                    checked={status === 'rejected'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Reject</span>
                </label>
              </div>
            </div>

            {status === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

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
                className={`btn-primary ${status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovalModal; 