import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const PayrollDetails = () => {
  const { id } = useParams();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: payroll, isLoading, error } = useQuery(
    ['payroll', id],
    () => api.get(`/api/payroll/${id}`).then(res => res.data)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const handleDownloadPDF = async () => {
    if (!payroll) {
      toast.error('No payroll data available');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePayslipPDF(payroll);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading payroll details</div>
        <div className="text-gray-500 mt-2">{error.message}</div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">Payroll not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <p className="text-gray-600">
              {getMonthName(payroll.month)} {payroll.year} - {payroll.employee?.firstName} {payroll.employee?.lastName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              {payroll.status}
            </span>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-sm text-gray-900 mt-1">
              {payroll.employee?.firstName} {payroll.employee?.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <p className="text-sm text-gray-900 mt-1">{payroll.employee?.employeeId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <p className="text-sm text-gray-900 mt-1">{payroll.employee?.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900 mt-1">{payroll.employee?.email}</p>
          </div>
        </div>
      </div>

      {/* Working Days Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Working Days Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{payroll.workingDays}</div>
            <div className="text-sm text-gray-600">Total Working Days</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{payroll.actualWorkingDays}</div>
            <div className="text-sm text-gray-600">Actual Working Days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{payroll.leaveDays}</div>
            <div className="text-sm text-gray-600">Leave Days</div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalculatorIcon className="h-5 w-5 mr-2" />
          Salary Breakdown
        </h2>
        
        {/* Earnings */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Earnings</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Basic Salary</span>
              <span className="font-medium">{formatCurrency(payroll.salary.basicSalary)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">House Rent Allowance (HRA)</span>
              <span className="font-medium">{formatCurrency(payroll.salary.hra)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Dearness Allowance (DA)</span>
              <span className="font-medium">{formatCurrency(payroll.salary.da)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Transport Allowance (TA)</span>
              <span className="font-medium">{formatCurrency(payroll.salary.ta)}</span>
            </div>
            {payroll.salary.performanceIncentive > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Performance Incentive</span>
                <span className="font-medium text-green-600">{formatCurrency(payroll.salary.performanceIncentive)}</span>
              </div>
            )}
            {payroll.salary.specialAllowance > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Special Allowance</span>
                <span className="font-medium">{formatCurrency(payroll.salary.specialAllowance)}</span>
              </div>
            )}
            {payroll.salary.medicalAllowance > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Medical Allowance</span>
                <span className="font-medium">{formatCurrency(payroll.salary.medicalAllowance)}</span>
              </div>
            )}
            {payroll.salary.conveyanceAllowance > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Conveyance Allowance</span>
                <span className="font-medium">{formatCurrency(payroll.salary.conveyanceAllowance)}</span>
              </div>
            )}
            {payroll.salary.foodAllowance > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Food Allowance</span>
                <span className="font-medium">{formatCurrency(payroll.salary.foodAllowance)}</span>
              </div>
            )}
            {payroll.salary.otherAllowances > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Other Allowances</span>
                <span className="font-medium">{formatCurrency(payroll.salary.otherAllowances)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
              <span className="font-semibold text-blue-800">Total Allowances</span>
              <span className="font-bold text-blue-800">{formatCurrency(payroll.salary.totalAllowances)}</span>
            </div>
            <div className="flex justify-between py-2 bg-green-50 px-3 rounded">
              <span className="font-semibold text-green-800">Gross Salary</span>
              <span className="font-bold text-green-800">{formatCurrency(payroll.salary.grossSalary)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Deductions</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Provident Fund (PF)</span>
              <span className="font-medium text-red-600">-{formatCurrency(payroll.salary.pf)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Income Tax</span>
              <span className="font-medium text-red-600">-{formatCurrency(payroll.salary.tax)}</span>
            </div>
            <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
              <span className="font-semibold text-red-800">Total Deductions</span>
              <span className="font-bold text-red-800">-{formatCurrency(payroll.salary.totalDeductions)}</span>
            </div>
            <div className="flex justify-between py-2 bg-yellow-50 px-3 rounded">
              <span className="font-semibold text-yellow-800">Leave Deduction</span>
              <span className="font-bold text-yellow-800">-{formatCurrency(payroll.salary.leaveDeduction)}</span>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg">
            <span className="text-lg font-bold text-green-800">Net Salary</span>
            <span className="text-lg font-bold text-green-800">{formatCurrency(payroll.salary.finalNetSalary)}</span>
          </div>
        </div>
      </div>

      {/* Leave Details */}
      {payroll.leaveBreakdown && Object.keys(payroll.leaveBreakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Leave Details
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-600">Total Leave Days</div>
                <div className="text-2xl font-bold text-blue-800">{payroll.leaveDays}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">Working Days</div>
                <div className="text-2xl font-bold text-green-800">{payroll.actualWorkingDays}/{payroll.workingDays}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-yellow-600">Leave Deduction</div>
                <div className="text-2xl font-bold text-yellow-800">-{formatCurrency(payroll.salary.leaveDeduction)}</div>
              </div>
            </div>
            
            {payroll.leaveBreakdown && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Leave Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(payroll.leaveBreakdown).map(([leaveType, days]) => (
                    <div key={leaveType} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{leaveType}</span>
                      <span className="font-medium">{days} days</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {payroll.monthLeaves && payroll.monthLeaves.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Leave History</h3>
                <div className="space-y-2">
                  {payroll.monthLeaves.map((leave) => (
                    <div key={leave.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{leave.leaveType}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                          {leave.reason && (
                            <div className="text-sm text-gray-600 mt-1">Reason: {leave.reason}</div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{leave.duration} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payroll Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Payroll Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payroll Period</label>
            <p className="text-sm text-gray-900 mt-1">
              {getMonthName(payroll.month)} {payroll.year}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Generated On</label>
            <p className="text-sm text-gray-900 mt-1">
              {new Date(payroll.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Generated By</label>
            <p className="text-sm text-gray-900 mt-1">
              User ID: {payroll.generatedBy}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payroll ID</label>
            <p className="text-sm text-gray-900 mt-1">{payroll.id}</p>
          </div>
        </div>
      </div>

      {/* Print/Download Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BanknotesIcon className="h-5 w-5 mr-2" />
          Actions
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Print Payslip
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentTextIcon className="h-4 w-4" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetails; 