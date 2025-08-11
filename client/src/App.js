import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import NewLeaveRequest from './pages/NewLeaveRequest';
import LeaveDetails from './pages/LeaveDetails';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Departments from './pages/Departments';
import LeaveTypes from './pages/LeaveTypes';
import Payroll from './pages/Payroll';
import PayrollDetails from './pages/PayrollDetails';
import Performance from './pages/Performance';
import Attendance from './pages/Attendance';
import Shifts from './pages/Shifts';
import AttendanceReports from './pages/AttendanceReports';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const ManagerRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="new-leave-request" element={<NewLeaveRequest />} />
            <Route path="leave-requests/:id" element={<LeaveDetails />} />
            <Route path="profile" element={<Profile />} />
            
            <Route path="users" element={
              <ManagerRoute>
                <Users />
              </ManagerRoute>
            } />
            
            <Route path="departments" element={
              <AdminRoute>
                <Departments />
              </AdminRoute>
            } />
            
            <Route path="leave-types" element={
              <AdminRoute>
                <LeaveTypes />
              </AdminRoute>
            } />

            <Route path="payroll" element={
              <PrivateRoute>
                <Payroll />
              </PrivateRoute>
            } />

            <Route path="payroll/:id" element={
              <PrivateRoute>
                <PayrollDetails />
              </PrivateRoute>
            } />

            <Route path="performance" element={
              <PrivateRoute>
                <Performance />
              </PrivateRoute>
            } />

            <Route path="attendance" element={
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            } />

            <Route path="shifts" element={
              <AdminRoute>
                <Shifts />
              </AdminRoute>
            } />

            <Route path="attendance-reports" element={
              <ManagerRoute>
                <AttendanceReports />
              </ManagerRoute>
            } />
          </Route>
        </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 