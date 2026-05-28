import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, AdminRoute } from './context/AuthContext';
import JobOffers from './pages/JobOffers';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import KanbanBoard from './pages/KanbanBoard';
import PublicJobs from './pages/PublicJobs';
import PublicJobApply from './pages/PublicJobApply';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CompanyProfile from './pages/CompanyProfile';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/jobs" element={<PublicJobs />} />
                    <Route path="/jobs/:id" element={<PublicJobApply />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/job-offers" element={<ProtectedRoute><JobOffers /></ProtectedRoute>} />
                    <Route path="/job-offers/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
                    <Route path="/job-offers/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                    <Route path="/job-offers/:id/edit" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
                    <Route path="/job-offers/:id/pipeline" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />

                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
