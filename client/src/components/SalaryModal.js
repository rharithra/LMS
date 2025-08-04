import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, CurrencyDollarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const SalaryModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    basicSalary: user?.salary?.basicSalary || 0,
    hra: user?.salary?.hra || 0,
    da: user?.salary?.da || 0,
    ta: user?.salary?.ta || 0,
    pf: user?.salary?.pf || 0,
    tax: user?.salary?.tax || 0,
    performanceIncentive: user?.salary?.performanceIncentive || 0,
    specialAllowance: user?.salary?.specialAllowance || 0,
    medicalAllowance: user?.salary?.medicalAllowance || 0,
    conveyanceAllowance: user?.salary?.conveyanceAllowance || 0,
    foodAllowance: user?.salary?.foodAllowance || 0,
    otherAllowances: user?.salary?.otherAllowances || 0
  });

  const queryClient = useQueryClient();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        basicSalary: user.salary?.basicSalary || 0,
        hra: user.salary?.hra || 0,
        da: user.salary?.da || 0,
        ta: user.salary?.ta || 0,
        pf: user.salary?.pf || 0,
        tax: user.salary?.tax || 0,
        performanceIncentive: user.salary?.performanceIncentive || 0,
        specialAllowance: user.salary?.specialAllowance || 0,
        medicalAllowance: user.salary?.medicalAllowance || 0,
        conveyanceAllowance: user.salary?.conveyanceAllowance || 0,
        foodAllowance: user.salary?.foodAllowance || 0,
        otherAllowances: user.salary?.otherAllowances || 0
      });
    }
  }, [user]);

  const updateSalaryMutation = useMutation(
    (data) => api.put(`/api/users/${user.id}/salary`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Salary updated successfully!');
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update salary');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSalaryMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateTotal = () => {
    const allowances = formData.hra + formData.da + formData.ta + 
                     formData.performanceIncentive + formData.specialAllowance + 
                     formData.medicalAllowance + formData.conveyanceAllowance + 
                     formData.foodAllowance + formData.otherAllowances;
    const deductions = formData.pf + formData.tax;
    return {
      grossSalary: formData.basicSalary + allowances,
      netSalary: formData.basicSalary + allowances - deductions,
      totalAllowances: allowances,
      totalDeductions: deductions
    };
  };

  const totals = calculateTotal();

  // Field configuration for better UX
  const fieldConfig = {
    basicSalary: { label: 'Basic Salary', editable: true, description: 'Core salary component - editable' },
    hra: { label: 'House Rent Allowance (HRA)', editable: true, description: 'Standard allowance - editable' },
    da: { label: 'Dearness Allowance (DA)', editable: true, description: 'Standard allowance - editable' },
    ta: { label: 'Transport Allowance (TA)', editable: true, description: 'Standard allowance - editable' },
    performanceIncentive: { label: 'Performance Incentive', editable: true, description: 'Variable based on performance - editable' },
    specialAllowance: { label: 'Special Allowance', editable: true, description: 'Additional allowance - editable' },
    medicalAllowance: { label: 'Medical Allowance', editable: true, description: 'Health benefit - editable' },
    conveyanceAllowance: { label: 'Conveyance Allowance', editable: true, description: 'Transport benefit - editable' },
    foodAllowance: { label: 'Food Allowance', editable: true, description: 'Meal benefit - editable' },
    otherAllowances: { label: 'Other Allowances', editable: true, description: 'Additional benefits - editable' },
    pf: { label: 'Provident Fund (PF)', editable: true, description: 'Retirement benefit - editable' },
    tax: { label: 'Income Tax', editable: true, description: 'Tax deduction - editable' }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Edit Salary - {user?.firstName} {user?.lastName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Salary Management Guide</h4>
              <p className="text-sm text-blue-700 mt-1">
                All salary components are editable. Basic salary, allowances, and deductions can be customized per employee. 
                Performance incentives are typically updated monthly based on performance reviews.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Salary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Basic Salary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldConfig.basicSalary.label}
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">{fieldConfig.basicSalary.description}</p>
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Allowances</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(fieldConfig).filter(([key]) => 
                ['hra', 'da', 'ta', 'performanceIncentive', 'specialAllowance', 'medicalAllowance', 'conveyanceAllowance', 'foodAllowance', 'otherAllowances'].includes(key)
              ).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {config.label}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-3">Deductions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(fieldConfig).filter(([key]) => 
                ['pf', 'tax'].includes(key)
              ).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {config.label}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Salary Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Basic Salary</div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{formData.basicSalary.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Allowances</div>
                <div className="text-lg font-bold text-green-600">
                  ₹{totals.totalAllowances.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Deductions</div>
                <div className="text-lg font-bold text-red-600">
                  ₹{totals.totalDeductions.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Net Salary</div>
                <div className="text-lg font-bold text-purple-600">
                  ₹{totals.netSalary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSalaryMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updateSalaryMutation.isLoading ? 'Updating...' : 'Update Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryModal; 