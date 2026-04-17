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


function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<PublicJobs />} />
                <Route path="/jobs/:id" element={<PublicJobApply />} />

                {/* Recruiter only routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/job-offers" element={<ProtectedRoute><JobOffers /></ProtectedRoute>} />
                <Route path="/job-offers/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
                <Route path="/job-offers/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                <Route path="/job-offers/:id/edit" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
                <Route path="/job-offers/:id/pipeline" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />

                {/* Unknown URL*/}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

