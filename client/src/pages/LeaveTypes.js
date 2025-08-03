import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LeaveTypeModal from '../components/LeaveTypeModal';

const LeaveTypes = () => {
  const { user } = useAuth();
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');

  const { data: leaveTypes, isLoading } = useQuery('leaveTypes', async () => {
    const response = await axios.get('/api/leave-types');
    return response.data;
  });

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500'
    };
    return colorMap[color] || 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage different types of leave and their default allocations.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setSelectedLeaveType(null);
              setModalMode('add');
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Add Leave Type
          </button>
        )}
      </div>

      {leaveTypes?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveTypes.map((leaveType) => (
            <div key={leaveType.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${getColorClass(leaveType.color)} flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {leaveType.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{leaveType.name}</h3>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  leaveType.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {leaveType.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Code</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{leaveType.code}</p>
                </div>
                
                {leaveType.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{leaveType.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Default Days</label>
                  <p className="mt-1 text-sm text-gray-900">{leaveType.defaultDays} days</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${getColorClass(leaveType.color)}`}></div>
                    <span className="text-sm text-gray-900 capitalize">{leaveType.color}</span>
                  </div>
                </div>
              </div>
              
              {user?.role === 'admin' && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedLeaveType(leaveType);
                      setModalMode('edit');
                      setIsModalOpen(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-500">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leave types found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first leave type.</p>
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                setSelectedLeaveType(null);
                setModalMode('add');
                setIsModalOpen(true);
              }}
              className="btn-primary"
            >
              Create Leave Type
            </button>
          )}
        </div>
      )}

      {/* Leave Type Modal */}
      {user?.role === 'admin' && (
        <LeaveTypeModal
          leaveType={selectedLeaveType}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLeaveType(null);
          }}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default LeaveTypes; 