import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

function App() {
    const token = localStorage.getItem('token');

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<PublicJobs />} />
                <Route path="/jobs/:id" element={<PublicJobApply />} />

                {/* Recruiter only routes */}
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/job-offers" element={token ? <JobOffers /> : <Navigate to="/login" />} />
                <Route path="/job-offers/create" element={token ? <CreateJob /> : <Navigate to="/login" />} />
                <Route path="/job-offers/:id" element={token ? <JobDetails /> : <Navigate to="/login" />} />
                <Route path="/job-offers/:id/edit" element={token ? <EditJob /> : <Navigate to="/login" />} />
                <Route path="/job-offers/:id/pipeline" element={token ? <KanbanBoard /> : <Navigate to="/login" />} />

                {/* Admin only */}
                <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />

                {/* False URL */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
