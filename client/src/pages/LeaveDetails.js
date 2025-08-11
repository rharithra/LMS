import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { api } from '../utils/api';
import { format } from 'date-fns';

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: leave, isLoading, error } = useQuery(['leave', id], async () => {
    const response = await api.get(`/api/leaves/${id}`);
    return response.data;
  }, {
    retry: 3,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Failed to fetch leave details:', error);
    }
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Leave request not found</h2>
        <button
          onClick={() => navigate('/leave-requests')}
          className="mt-4 btn-primary"
        >
          Back to Leave Requests
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/leave-requests')}
          className="text-blue-600 hover:text-blue-500 mb-4"
        >
          ← Back to Leave Requests
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Leave Request Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
              </h2>
              <span className={getStatusClass(leave.status)}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(leave.startDate), 'EEEE, MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(leave.endDate), 'EEEE, MMMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Duration</label>
                <p className="mt-1 text-sm text-gray-900">{leave.duration} day(s)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Reason</label>
                <p className="mt-1 text-sm text-gray-900">{leave.reason}</p>
              </div>

              {leave.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rejection Reason</label>
                  <p className="mt-1 text-sm text-red-600">{leave.rejectionReason}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(leave.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {leave.employee?.firstName} {leave.employee?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                <p className="mt-1 text-sm text-gray-900">{leave.employee?.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <p className="mt-1 text-sm text-gray-900">{leave.employee?.department}</p>
              </div>
            </div>
          </div>

          {leave.approvedBy && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approved By</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {leave.approvedBy?.firstName} {leave.approvedBy?.lastName}
                  </p>
                </div>
                {leave.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Approved On</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(leave.approvedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails; 