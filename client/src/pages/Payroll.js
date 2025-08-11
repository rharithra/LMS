import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { generatePayslipPDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const Payroll = () => {
  const { user } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [workingDays, setWorkingDays] = useState(22);
  const [downloadingPDFs, setDownloadingPDFs] = useState(new Set());

  const queryClient = useQueryClient();

  // Fetch payroll data
  const { data: payrollData, isLoading, refetch } = useQuery(
    'payroll', 
    () => api.get('/api/payroll').then(res => res.data),
    {
      refetchInterval: 15000, // Refetch every 15 seconds
      refetchOnWindowFocus: true,
      staleTime: 5000
    }
  );

  // Fetch users for payroll generation
  const { data: usersData } = useQuery('users', () =>
    api.get('/api/users').then(res => res.data)
  );

  // Fetch payroll stats
  const { data: payrollStats } = useQuery(
    'payrollStats', 
    () => api.get('/api/payroll/stats').then(res => res.data),
    {
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
      staleTime: 5000
    }
  );

  // Generate payroll mutation
  const generatePayrollMutation = useMutation(
    (data) => api.post('/api/payroll/generate', data),
    {
      onSuccess: () => {
        // Invalidate all payroll-related queries
        queryClient.invalidateQueries('payroll');
        queryClient.invalidateQueries('payrollStats');
        queryClient.invalidateQueries(['employeePayroll']); // Invalidate employee dashboard payroll
        queryClient.refetchQueries('payroll');
        queryClient.refetchQueries('payrollStats');
        queryClient.refetchQueries(['employeePayroll']);
        toast.success('Payroll generated successfully!');
        setShowGenerateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate payroll');
      }
    }
  );

  // Generate bulk payroll mutation
  const generateBulkPayrollMutation = useMutation(
    (data) => api.post('/api/payroll/bulk', data),
    {
      onSuccess: (response) => {
        // Invalidate all payroll-related queries
        queryClient.invalidateQueries('payroll');
        queryClient.invalidateQueries('payrollStats');
        queryClient.invalidateQueries(['employeePayroll']); // Invalidate employee dashboard payroll
        queryClient.refetchQueries('payroll');
        queryClient.refetchQueries('payrollStats');
        queryClient.refetchQueries(['employeePayroll']);
        toast.success(`Bulk payroll generated for ${response.data.count} employees!`);
        setShowBulkGenerateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate bulk payroll');
      }
    }
  );

  const handleGeneratePayroll = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    generatePayrollMutation.mutate({
      employeeId: selectedEmployee,
      month: selectedMonth,
      year: selectedYear,
      workingDays
    });
  };

  const handleGenerateBulkPayroll = () => {
    generateBulkPayrollMutation.mutate({
      month: selectedMonth,
      year: selectedYear
    });
  };

  const handleDownloadPDF = async (payroll) => {
    setDownloadingPDFs(prev => new Set(prev).add(payroll.id));
    
    try {
      // Fetch the detailed payroll data
      const response = await api.get(`/api/payroll/${payroll.id}`);
      const payrollData = response.data;
      
      await generatePayslipPDF(payrollData);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDFs(prev => {
        const newSet = new Set(prev);
        newSet.delete(payroll.id);
        return newSet;
      });
    }
  };

  const handleDownloadAllPDFs = async () => {
    if (!payrollData || payrollData.length === 0) {
      toast.error('No payroll data available');
      return;
    }

    toast.loading('Downloading all PDFs... This may take a moment.', { duration: 3000 });
    
    try {
      for (const payroll of payrollData) {
        setDownloadingPDFs(prev => new Set(prev).add(payroll.id));
        
        try {
          const response = await api.get(`/api/payroll/${payroll.id}`);
          const payrollData = response.data;
          await generatePayslipPDF(payrollData);
          
          // Small delay to prevent browser from being overwhelmed
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error downloading PDF for payroll ${payroll.id}:`, error);
        } finally {
          setDownloadingPDFs(prev => {
            const newSet = new Set(prev);
            newSet.delete(payroll.id);
            return newSet;
          });
        }
      }
      
      toast.success('All PDFs downloaded successfully!');
    } catch (error) {
      console.error('Error downloading all PDFs:', error);
      toast.error('Some PDFs failed to download. Please try again.');
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'employee' ? 'My Payroll' : 'Payroll Management'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'employee' 
              ? 'View your payroll history and salary details' 
              : 'Manage employee payroll and salary information'
            }
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Generate Payroll
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowBulkGenerateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Bulk Generate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payrolls</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrollStats?.totalPayrolls || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrollStats?.currentMonthPayrolls || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(payrollStats?.totalSalaryPaid || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(payrollStats?.averageSalary || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Working Days Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Days Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Total Days</div>
            <div className="text-2xl font-bold text-blue-800">
              {payrollData?.payrolls?.[0]?.workingDays || 22}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">Working Days</div>
            <div className="text-2xl font-bold text-green-800">
              {payrollData?.payrolls?.[0]?.actualWorkingDays || 22}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-600">Leave Days</div>
            <div className="text-2xl font-bold text-red-800">
              {payrollData?.payrolls?.[0]?.leaveDays || 0}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-yellow-600">Attendance %</div>
            <div className="text-2xl font-bold text-yellow-800">
              {payrollData?.[0] ? 
                Math.round((payrollData[0].actualWorkingDays / payrollData[0].workingDays) * 100) : 
                100}%
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-semibold text-gray-800 mb-2">How Working Days Are Calculated:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Total Days:</strong> Standard working days for the month (usually 22)</li>
            <li>• <strong>Leave Days:</strong> Approved leave days taken during the month</li>
            <li>• <strong>Working Days:</strong> Total Days - Leave Days</li>
            <li>• <strong>Salary Deduction:</strong> (Leave Days × Daily Rate) is deducted from salary</li>
          </ul>
        </div>
      </div>

      {/* Payroll List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
          {payrollData && payrollData.length > 0 && (
            <button
              onClick={handleDownloadAllPDFs}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download All PDFs
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData && payrollData.length > 0 ? (
                payrollData.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee?.firstName} {payroll.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.employee?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getMonthName(payroll.month)} {payroll.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payroll.actualWorkingDays || payroll.workingDays || 22}/{payroll.workingDays || 22}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payroll.leaveDays || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.grossSalary || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(payroll.netSalary || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`/payroll/${payroll.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(payroll)}
                          disabled={downloadingPDFs.has(payroll.id)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          {downloadingPDFs.has(payroll.id) ? 'Downloading...' : 'PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Records</h3>
                      <p className="text-gray-600 mb-4">
                        No payroll records found. Generate payroll for employees to see them here.
                      </p>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                          onClick={() => setShowGenerateModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Generate Payroll
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Payroll</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {usersData?.users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.employeeId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Days
                  </label>
                  <input
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="31"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePayroll}
                  disabled={generatePayrollMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {generatePayrollMutation.isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generate Payroll Modal */}
      {showBulkGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generate Bulk Payroll
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Warning
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>This will generate payroll for ALL employees with salary information for the selected month/year. Existing payroll records for this period will be skipped.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBulkGenerateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateBulkPayroll}
                  disabled={generateBulkPayrollMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {generateBulkPayrollMutation.isLoading ? 'Generating...' : 'Generate Bulk Payroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll; 