import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import DepartmentModal from '../components/DepartmentModal';

const Departments = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');

  const { data: departments, isLoading } = useQuery('departments', async () => {
    const response = await axios.get('/api/departments');
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage organizational departments and their settings.
          </p>
        </div>
        <button 
          onClick={() => {
            setSelectedDepartment(null);
            setModalMode('add');
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Department
        </button>
      </div>

      {departments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id || dept.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  dept.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Code</label>
                  <p className="mt-1 text-sm text-gray-900">{dept.code}</p>
                </div>
                
                {dept.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{dept.description}</p>
                  </div>
                )}
                
                {dept.head && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department Head</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {dept.head.firstName} {dept.head.lastName}
                    </p>
                  </div>
                )}
                
                {dept.employeeCount !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employees</label>
                    <p className="mt-1 text-sm text-gray-900">{dept.employeeCount}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedDepartment(dept);
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
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first department.</p>
          <button 
            onClick={() => {
              setSelectedDepartment(null);
              setModalMode('add');
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Create Department
          </button>
        </div>
      )}

      {/* Department Modal */}
      <DepartmentModal
        department={selectedDepartment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDepartment(null);
        }}
        mode={modalMode}
      />
    </div>
  );
};

export default Departments; 