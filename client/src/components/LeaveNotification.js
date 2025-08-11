import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const LeaveNotification = ({ user }) => {
  const [lastLeaveCount, setLastLeaveCount] = useState(0);
  const [lastPendingCount, setLastPendingCount] = useState(0);

  const { data: leaveData } = useQuery('leaves', async () => {
    const response = await api.get('/api/leaves');
    return response.data;
  }, {
    retry: 3,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Failed to fetch leaves:', error);
    }
  });

  const { data: statsData } = useQuery('leaveStats', async () => {
    const response = await api.get('/api/leaves/stats');
    return response.data;
  }, {
    retry: 3,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Failed to fetch leave stats:', error);
    }
  });

  useEffect(() => {
    if (leaveData?.leaves && statsData) {
      const currentLeaveCount = leaveData.leaves.length;
      const currentPendingCount = statsData.pending;

      // Check for new leave requests
      if (currentLeaveCount > lastLeaveCount && lastLeaveCount > 0) {
        toast.success('New leave request submitted successfully!', {
          icon: '🎉',
          duration: 4000
        });
      }

      // Check for status changes
      if (currentPendingCount < lastPendingCount && lastPendingCount > 0) {
        // Check if any request was approved
        const approvedRequests = leaveData.leaves.filter(leave => 
          leave.status === 'approved' && 
          new Date(leave.approvedAt).getTime() > Date.now() - 5000 // Approved in last 5 seconds
        );
        
        if (approvedRequests.length > 0) {
          const approvedRequest = approvedRequests[0];
          toast.success(`Your ${approvedRequest.leaveType} leave has been approved! Leave balance updated.`, {
            icon: '✅',
            duration: 5000
          });
        } else {
          toast.success('A leave request has been processed!', {
            icon: '✅',
            duration: 4000
          });
        }
      }

      setLastLeaveCount(currentLeaveCount);
      setLastPendingCount(currentPendingCount);
    }
  }, [leaveData, statsData, lastLeaveCount, lastPendingCount]);

  // Show notification for pending requests
  const pendingRequests = leaveData?.leaves?.filter(leave => leave.status === 'pending') || [];
  
  if (pendingRequests.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              You have {pendingRequests.length} pending leave request{pendingRequests.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your manager will review and approve these requests soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveNotification; 