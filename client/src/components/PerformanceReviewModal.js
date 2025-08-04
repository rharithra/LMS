import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const PerformanceReviewModal = ({ isOpen, onClose, employee, kpis, users }) => {
  const [formData, setFormData] = useState({
    employeeId: employee?.id || '',
    reviewPeriod: '',
    reviewDate: new Date().toISOString().split('T')[0],
    kpiScores: [],
    strengths: [''],
    areasOfImprovement: [''],
    recommendations: ['']
  });

  const queryClient = useQueryClient();

  const addReviewMutation = useMutation(
    (data) => api.post('/api/performance-reviews', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('performanceReviews');
        queryClient.invalidateQueries('performanceStats');
        queryClient.invalidateQueries('users');
        toast.success('Performance review submitted successfully!');
        onClose();
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      employeeId: employee?.id || '',
      reviewPeriod: '',
      reviewDate: new Date().toISOString().split('T')[0],
      kpiScores: [],
      strengths: [''],
      areasOfImprovement: [''],
      recommendations: ['']
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.reviewPeriod || formData.kpiScores.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    // Filter out empty strengths, areas of improvement, and recommendations
    const filteredData = {
      ...formData,
      strengths: formData.strengths.filter(s => s.trim() !== ''),
      areasOfImprovement: formData.areasOfImprovement.filter(a => a.trim() !== ''),
      recommendations: formData.recommendations.filter(r => r.trim() !== '')
    };

    addReviewMutation.mutate(filteredData);
  };

  const handleKpiScoreChange = (kpiId, score) => {
    setFormData(prev => {
      const existingIndex = prev.kpiScores.findIndex(k => k.kpiId === kpiId);
      const kpi = kpis.find(k => k.id === kpiId);
      
      if (existingIndex >= 0) {
        const newScores = [...prev.kpiScores];
        newScores[existingIndex] = { kpiId, score, weightage: kpi.weightage };
        return { ...prev, kpiScores: newScores };
      } else {
        return {
          ...prev,
          kpiScores: [...prev.kpiScores, { kpiId, score, weightage: kpi.weightage }]
        };
      }
    });
  };

  const addField = (fieldType) => {
    setFormData(prev => ({
      ...prev,
      [fieldType]: [...prev[fieldType], '']
    }));
  };

  const updateField = (fieldType, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldType]: prev[fieldType].map((item, i) => i === index ? value : item)
    }));
  };

  const removeField = (fieldType, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldType]: prev[fieldType].filter((_, i) => i !== index)
    }));
  };

  const calculateOverallRating = () => {
    if (formData.kpiScores.length === 0) return 0;
    
    const totalWeightage = formData.kpiScores.reduce((sum, kpi) => sum + kpi.weightage, 0);
    const weightedScore = formData.kpiScores.reduce((sum, kpi) => 
      sum + (kpi.score * kpi.weightage), 0
    ) / totalWeightage;
    
    return weightedScore.toFixed(1);
  };

  const calculateIncentive = () => {
    const rating = parseFloat(calculateOverallRating());
    if (rating >= 4.5) return 10000;
    if (rating >= 4.0) return 7500;
    if (rating >= 3.5) return 5000;
    if (rating >= 3.0) return 2500;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Performance Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {users?.filter(u => u.role === 'employee').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Period *
              </label>
              <input
                type="text"
                value={formData.reviewPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                placeholder="e.g., Q1-2024, Q2-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* KPI Scoring */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">KPI Assessment</h4>
            <div className="space-y-4">
              {kpis?.map((kpi) => (
                <div key={kpi.id} className="bg-white p-4 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{kpi.name}</div>
                      <div className="text-sm text-gray-500">{kpi.description}</div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{kpi.weightage}%</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Score:</span>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <label key={score} className="flex items-center">
                        <input
                          type="radio"
                          name={`kpi-${kpi.id}`}
                          value={score}
                          onChange={(e) => handleKpiScoreChange(kpi.id, parseFloat(e.target.value))}
                          className="mr-1"
                        />
                        <span className="text-sm">{score}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Strengths</h4>
            <div className="space-y-2">
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => updateField('strengths', index, e.target.value)}
                    placeholder="Enter strength..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formData.strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField('strengths', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField('strengths')}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                + Add Strength
              </button>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-3">Areas for Improvement</h4>
            <div className="space-y-2">
              {formData.areasOfImprovement.map((area, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => updateField('areasOfImprovement', index, e.target.value)}
                    placeholder="Enter area for improvement..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {formData.areasOfImprovement.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField('areasOfImprovement', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField('areasOfImprovement')}
                className="text-yellow-600 hover:text-yellow-800 text-sm"
              >
                + Add Area
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {formData.recommendations.map((rec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => updateField('recommendations', index, e.target.value)}
                    placeholder="Enter recommendation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {formData.recommendations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField('recommendations', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField('recommendations')}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                + Add Recommendation
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Review Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Overall Rating</div>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateOverallRating()}/5.0
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Performance Incentive</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{calculateIncentive().toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">KPIs Assessed</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formData.kpiScores.length}
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
              disabled={addReviewMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceReviewModal; 