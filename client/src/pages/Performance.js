import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  ChartBarIcon, 
  FlagIcon, 
  ClipboardDocumentListIcon,
  UserPlusIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import PerformanceReviewModal from '../components/PerformanceReviewModal';
import GoalModal from '../components/GoalModal';
import PromotionModal from '../components/PromotionModal';

const Performance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: performanceStats } = useQuery('performanceStats', () =>
    api.get('/api/performance/stats').then(res => res.data)
  );

  const { data: kpis } = useQuery('kpis', () =>
    api.get('/api/kpis').then(res => res.data)
  );

  const { data: goals } = useQuery('performanceGoals', () =>
    api.get('/api/performance-goals').then(res => res.data)
  );

  const { data: reviews } = useQuery('performanceReviews', () =>
    api.get('/api/performance-reviews').then(res => res.data)
  );

  const { data: promotions } = useQuery('promotions', () =>
    api.get('/api/promotions').then(res => res.data)
  );

  const { data: usersData } = useQuery('users', () =>
    api.get('/api/users').then(res => res.data)
  );

  const handleStartReview = (employee) => {
    setSelectedEmployee(employee);
    setShowReviewModal(true);
  };

  const handleAddGoal = () => {
    setShowGoalModal(true);
  };

  const handleAddPromotion = () => {
    setShowPromotionModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-gray-100 text-gray-800',
      'approved': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
        <p className="text-gray-600 mt-1">Track KPIs, goals, reviews, and promotions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceStats?.totalReviews || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FlagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals?.filter(g => g.status === 'in-progress').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceStats?.averageRating || 0}/5.0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Incentives</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(performanceStats?.totalIncentives || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'goals', name: 'Goals', icon: FlagIcon },
              { id: 'reviews', name: 'Reviews', icon: ClipboardDocumentListIcon },
              { id: 'promotions', name: 'Promotions', icon: UserPlusIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* KPIs */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
                  <div className="space-y-3">
                    {kpis?.map((kpi) => (
                      <div key={kpi.id} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <div className="font-medium text-gray-900">{kpi.name}</div>
                          <div className="text-sm text-gray-500">{kpi.description}</div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{kpi.weightage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Reviews</h3>
                  <div className="space-y-3">
                    {performanceStats?.recentReviews?.map((review) => (
                      <div key={review.id} className="p-3 bg-white rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">
                              {review.employee?.firstName} {review.employee?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{review.reviewPeriod}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{review.overallRating}/5.0</div>
                            <div className="text-sm text-green-600">₹{review.performanceIncentive.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Performance Goals</h3>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    onClick={handleAddGoal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Goal
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals?.map((goal) => (
                  <div key={goal.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{goal.startDate}</span>
                        <span>{goal.endDate}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                        {goal.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Performance Reviews</h3>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Start Review
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {reviews?.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {review.employee?.firstName} {review.employee?.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Reviewed by {review.reviewer?.firstName} {review.reviewer?.lastName} • {review.reviewPeriod}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{review.overallRating}/5.0</div>
                        <div className="text-sm text-green-600">₹{review.performanceIncentive.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {review.areasOfImprovement.map((area, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Promotions & Increments</h3>
                {user?.role === 'admin' && (
                  <button
                    onClick={handleAddPromotion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Promotion
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {promotions?.map((promotion) => (
                  <div key={promotion.id} className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {promotion.employee?.firstName} {promotion.employee?.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {promotion.fromPosition} → {promotion.toPosition}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +₹{promotion.salaryIncrease.toLocaleString()}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{promotion.reason}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Effective: {promotion.effectiveDate}</span>
                        <span>Approved by: {promotion.approver?.firstName} {promotion.approver?.lastName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PerformanceReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        employee={selectedEmployee}
        kpis={kpis}
        users={usersData?.users || []}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        users={usersData?.users || []}
      />

      <PromotionModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        users={usersData?.users || []}
      />
    </div>
  );
};

export default Performance; 