import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import JobOffers from './pages/JobOffers';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/jobs" element={<PublicJobs />} /> */}

                {/* Recruiter only routes */}
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                <Route path="/job-offers" element={<JobOffers />} />
                <Route path="/job-offers/create" element={<CreateJob />} />
                <Route path="/job-offers/:id" element={<JobDetails />} />
                <Route path="/job-offers/:id/edit" element={<EditJob />} />

                {/* Unknown URL*/}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

