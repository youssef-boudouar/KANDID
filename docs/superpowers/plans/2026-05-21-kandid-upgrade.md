# KANDID Professional Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform KANDID from a working MVP into a polished, production-grade multi-tenant ATS that impresses in a portfolio or investor demo.

**Architecture:** Laravel 11 API backend (port 8000) + React 19 Vite frontend (port 5173), communicating via REST with Sanctum token auth. All changes preserve the existing design system (light theme, black accent, Plus Jakarta Sans, rounded-2xl cards, blue/purple/amber/emerald/red Kanban palette).

**Tech Stack:** Laravel 11, PHP 8.2, React 19, Vite 7, Tailwind CSS v4, Axios, @hello-pangea/dnd, MySQL 8, Laravel Sanctum. New packages: `recharts`, `framer-motion`.

---

## File Map

### New files — Frontend
- `frontend/.env` — Vite env vars
- `frontend/src/api/axios.js` — shared Axios instance with interceptors
- `frontend/src/context/AuthContext.jsx` — auth state + hooks
- `frontend/src/components/RecruiterNavbar.jsx` — shared recruiter nav
- `frontend/src/components/PublicNavbar.jsx` — shared public nav
- `frontend/src/components/Toast.jsx` — notification toast
- `frontend/src/components/ConfirmDialog.jsx` — replaces window.confirm()
- `frontend/src/components/Skeleton.jsx` — animated skeleton loader
- `frontend/src/pages/TagManager.jsx` — modal for managing company tags

### Modified files — Frontend
- `frontend/src/App.jsx` — add AuthProvider, ProtectedRoute, AdminRoute
- `frontend/src/pages/Dashboard.jsx` — use RecruiterNavbar, Toast, Skeleton, activity feed, recharts
- `frontend/src/pages/JobOffers.jsx` — use RecruiterNavbar, Toast, tag pills, tag filter
- `frontend/src/pages/CreateJob.jsx` — use RecruiterNavbar, tag picker
- `frontend/src/pages/EditJob.jsx` — use RecruiterNavbar, tag picker
- `frontend/src/pages/JobDetails.jsx` — use RecruiterNavbar, ConfirmDialog, tabs
- `frontend/src/pages/KanbanBoard.jsx` — use RecruiterNavbar, fix reorder bug, bulk actions, advanced filters
- `frontend/src/pages/AdminDashboard.jsx` — use ConfirmDialog, Toast
- `frontend/src/pages/PublicJobs.jsx` — use PublicNavbar, pagination
- `frontend/src/pages/PublicJobApply.jsx` — use PublicNavbar

### New files — Backend
- `app/Http/Requests/StoreJobOfferRequest.php`
- `app/Http/Requests/UpdateJobOfferRequest.php`
- `app/Http/Requests/ApplyToJobRequest.php`
- `app/Http/Requests/StoreNoteRequest.php`
- `app/Http/Requests/MoveApplicationRequest.php`
- `app/Http/Resources/JobOfferResource.php`
- `app/Http/Resources/ApplicationResource.php`
- `app/Http/Resources/CandidateResource.php`
- `app/Http/Resources/NoteResource.php`
- `app/Http/Controllers/TagController.php`
- `app/Http/Controllers/ActivityController.php`
- `app/Models/Activity.php`
- `app/Mail/NewApplicationNotification.php`
- `app/Policies/JobOfferPolicy.php`
- `app/Policies/ApplicationPolicy.php`
- `app/Policies/NotePolicy.php`
- `database/migrations/YYYY_create_activities_table.php`
- `database/migrations/YYYY_add_expires_at_to_invitations_table.php`
- `database/migrations/YYYY_add_database_indexes.php`
- `database/migrations/YYYY_add_soft_deletes.php`
- `tests/Feature/AuthTest.php`
- `tests/Feature/JobOfferTest.php`
- `tests/Feature/ApplicationTest.php`
- `tests/Feature/NoteTest.php`
- `tests/Feature/AdminTest.php`

### Modified files — Backend
- `config/cors.php` — restrict to FRONTEND_URL
- `bootstrap/app.php` — rate limiting
- `routes/api.php` — add tag routes, activity route, reorder route
- `app/Http/Controllers/JobOfferController.php` — use Form Requests, Resources, eager-load tags
- `app/Http/Controllers/ApplicationController.php` — use Form Request, Resource, log activity
- `app/Http/Controllers/NoteController.php` — use Form Request, Resource, log activity
- `app/Http/Controllers/PublicJobController.php` — use Form Request, paginate, send mail, log activity
- `app/Http/Controllers/Auth/AuthController.php` — check invite expiry
- `app/Http/Controllers/DashboardController.php` — enhanced stats
- `app/Services/DashboardService.php` — time-to-hire, weekly delta, 14-day trend
- `app/Services/AuthService.php` — set expires_at on invite
- `app/Models/JobOffer.php` — SoftDeletes, scopeForCompany
- `app/Models/Application.php` — SoftDeletes
- `app/Models/Company.php` — SoftDeletes
- `app/Providers/AppServiceProvider.php` — register policies

---

## Phase 1 — Architecture & Code Quality

---

### Task 1: Create frontend/.env and shared Axios instance

**Files:**
- Create: `frontend/.env`
- Create: `frontend/src/api/axios.js`

- [ ] **Step 1: Create `frontend/.env`**

```
VITE_API_URL=http://localhost:8000/api
```

- [ ] **Step 2: Create `frontend/src/api/axios.js`**

```js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/.env frontend/src/api/axios.js
git commit -m "feat: add shared axios instance with auth interceptors"
```

---

### Task 2: Replace raw axios calls in all page files

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`
- Modify: `frontend/src/pages/JobOffers.jsx`
- Modify: `frontend/src/pages/CreateJob.jsx`
- Modify: `frontend/src/pages/EditJob.jsx`
- Modify: `frontend/src/pages/JobDetails.jsx`
- Modify: `frontend/src/pages/KanbanBoard.jsx`
- Modify: `frontend/src/pages/AdminDashboard.jsx`
- Modify: `frontend/src/pages/PublicJobs.jsx`
- Modify: `frontend/src/pages/PublicJobApply.jsx`
- Modify: `frontend/src/pages/Login.jsx`
- Modify: `frontend/src/pages/Register.jsx`

In every file, replace:
```js
import axios from 'axios';
```
with:
```js
import api from '../api/axios';
```

Then replace every occurrence of:
- `axios.get('http://localhost:8000/api/...', { headers: { Authorization: \`Bearer ${token}\` } })` → `api.get('/...')`
- `axios.post('http://localhost:8000/api/...', data, { headers: ... })` → `api.post('/...', data)`
- `axios.put(...)` → `api.put(...)`
- `axios.delete(...)` → `api.delete(...)`

For `Login.jsx` and `Register.jsx` (no token yet), the interceptor handles it (no token means no header — that's correct). Keep `Login.jsx` using the raw URL for the login call but swap to `api.post('/login', ...)`.

For `PublicJobs.jsx` and `PublicJobApply.jsx` (no auth needed), the interceptor simply won't add a header if no token is present — that's correct behavior.

- [ ] **Step 1: Update `Dashboard.jsx`** — change import, remove `const token = localStorage.getItem('token')` and `const headers = { Authorization: \`Bearer ${token}\` }` variables, remove `{ headers }` from every call.

- [ ] **Step 2: Update `JobOffers.jsx`** — same pattern.

- [ ] **Step 3: Update `CreateJob.jsx`** — same pattern (also remove manual token from invite button handler inside the component).

- [ ] **Step 4: Update `EditJob.jsx`** — same pattern.

- [ ] **Step 5: Update `JobDetails.jsx`** — same pattern.

- [ ] **Step 6: Update `KanbanBoard.jsx`** — same pattern (multiple axios calls inside handlers, not just useEffect).

- [ ] **Step 7: Update `AdminDashboard.jsx`** — same pattern.

- [ ] **Step 8: Update `PublicJobs.jsx`** — change import only (no headers to remove).

- [ ] **Step 9: Update `PublicJobApply.jsx`** — change import only.

- [ ] **Step 10: Update `Login.jsx`**

```js
import api from '../api/axios';
// replace: axios.post("http://localhost:8000/api/login", ...)
// with:    api.post("/login", ...)
```

- [ ] **Step 11: Update `Register.jsx`** (read the file first, apply same pattern)

- [ ] **Step 12: Verify the dev server starts without errors**

```bash
cd frontend && npm run dev 2>&1 | head -20
```

- [ ] **Step 13: Commit**

```bash
git add frontend/src/pages/
git commit -m "refactor: replace hardcoded axios calls with shared api instance"
```

---

### Task 3: Extract `<RecruiterNavbar />` component

**Files:**
- Create: `frontend/src/components/RecruiterNavbar.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx`
- Modify: `frontend/src/pages/JobOffers.jsx`
- Modify: `frontend/src/pages/CreateJob.jsx`
- Modify: `frontend/src/pages/EditJob.jsx`
- Modify: `frontend/src/pages/JobDetails.jsx`
- Modify: `frontend/src/pages/KanbanBoard.jsx`

- [ ] **Step 1: Create `frontend/src/components/RecruiterNavbar.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function RecruiterNavbar({ activePage }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    useEffect(() => {
        api.get('/user').then((res) => {
            setUserName(res.data.name || '');
            setCompanyName(res.data.company?.name || '');
        });
    }, []);

    const sendInvite = () => {
        if (!inviteEmail) return;
        api.post('/team/invite', { email: inviteEmail })
            .then(() => {
                setInviteStatus('success');
                setInviteEmail('');
                setTimeout(() => { setShowInvite(false); setInviteStatus(''); }, 1500);
            })
            .catch(() => setInviteStatus('error'));
    };

    const navItem = (label, page, path) => {
        const active = activePage === page;
        return (
            <span
                onClick={() => navigate(path)}
                className={`cursor-pointer transition-colors text-sm font-medium ${
                    active
                        ? 'text-black font-bold border-b-2 border-black pb-1'
                        : 'text-gray-500 hover:text-black'
                }`}
            >
                {label}
            </span>
        );
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
            <div className="flex items-center max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex-1 flex items-center">
                    <img
                        src="/kandid_logo.png"
                        alt="Kandid"
                        className="h-8 w-auto object-contain select-none cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    />
                </div>

                {/* Nav Links */}
                <div className="flex-1 flex items-center justify-center gap-6">
                    {navItem('Dashboard', 'dashboard', '/dashboard')}
                    {navItem('Job Offers', 'job-offers', '/job-offers')}
                    {activePage === 'pipeline' && navItem('Pipeline', 'pipeline', '#')}
                </div>

                {/* Right side */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold shadow-md select-none">
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    {/* Invite dropdown */}
                    <div className="relative">
                        {showInvite && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowInvite(false)} />
                        )}
                        <button
                            onClick={() => setShowInvite(!showInvite)}
                            className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
                        >
                            + Invite
                        </button>
                        {showInvite && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 z-50">
                                <p className="text-sm font-bold text-gray-900 mb-3">Invite Team Member</p>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                                    placeholder="colleague@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 mb-3"
                                />
                                {inviteStatus === 'success' && (
                                    <p className="text-xs text-emerald-600 mb-2">Invitation sent!</p>
                                )}
                                {inviteStatus === 'error' && (
                                    <p className="text-xs text-red-500 mb-2">Failed to send invitation.</p>
                                )}
                                <button
                                    onClick={sendInvite}
                                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Send Invite
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium ml-2"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default RecruiterNavbar;
```

- [ ] **Step 2: Replace navbar in `Dashboard.jsx`**

Remove the entire `<nav>` block and its state variables (`companyName`, `userName`, `showInvite`, `inviteEmail`) and the `useEffect` call that fetches `/user`. Replace with:

```jsx
import RecruiterNavbar from '../components/RecruiterNavbar';
// at top of return:
<RecruiterNavbar activePage="dashboard" />
```

- [ ] **Step 3: Replace navbar in `JobOffers.jsx`** — same: remove nav JSX + its 4 state vars + `/user` fetch, add `<RecruiterNavbar activePage="job-offers" />`.

- [ ] **Step 4: Replace navbar in `CreateJob.jsx`** — same pattern, `activePage="job-offers"`.

- [ ] **Step 5: Replace navbar in `EditJob.jsx`** — same pattern, `activePage="job-offers"`.

- [ ] **Step 6: Replace navbar in `JobDetails.jsx`** — same pattern, `activePage="job-offers"`.

- [ ] **Step 7: Replace navbar in `KanbanBoard.jsx`** — same pattern, `activePage="pipeline"`.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/RecruiterNavbar.jsx frontend/src/pages/
git commit -m "refactor: extract RecruiterNavbar component, remove duplicated nav code"
```

---

### Task 4: Extract `<PublicNavbar />` component

**Files:**
- Create: `frontend/src/components/PublicNavbar.jsx`
- Modify: `frontend/src/pages/PublicJobs.jsx`
- Modify: `frontend/src/pages/PublicJobApply.jsx`

- [ ] **Step 1: Create `frontend/src/components/PublicNavbar.jsx`**

```jsx
import { useNavigate } from 'react-router-dom';

function PublicNavbar() {
    const navigate = useNavigate();
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <img
                    src="/kandid_logo.png"
                    alt="Kandid"
                    className="h-7 w-auto object-contain cursor-pointer select-none"
                    onClick={() => navigate('/jobs')}
                />
                <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-medium">
                    <a href="/jobs" className="text-[#0a0a0a] font-semibold border-b-2 border-[#0a0a0a] pb-0.5">
                        Browse Jobs
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden md:inline-block text-sm text-gray-500 hover:text-[#0a0a0a] transition-colors font-medium"
                    >
                        For Recruiters
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[#0a0a0a] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default PublicNavbar;
```

- [ ] **Step 2: Replace navbar in `PublicJobs.jsx`**

```jsx
import PublicNavbar from '../components/PublicNavbar';
// replace the <nav>...</nav> block with:
<PublicNavbar />
```

- [ ] **Step 3: Replace navbar in `PublicJobApply.jsx`** — same: replace `<nav>...</nav>` with `<PublicNavbar />`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/PublicNavbar.jsx frontend/src/pages/PublicJobs.jsx frontend/src/pages/PublicJobApply.jsx
git commit -m "refactor: extract PublicNavbar component"
```

---

### Task 5: Create AuthContext and update App.jsx

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create `frontend/src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));

    const login = (newToken, user) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', user.role);
        setToken(newToken);
        setRole(user.role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
    const { token, role } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
}
```

- [ ] **Step 2: Update `frontend/src/App.jsx`**

```jsx
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

                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
```

- [ ] **Step 3: Update `Login.jsx` to call `login()` from context instead of raw localStorage**

```jsx
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    // ...
    // in handleLogin .then():
    login(response.data.token, response.data.user);
    // navigate based on role:
    if (response.data.user.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
}
```

- [ ] **Step 4: Update `RecruiterNavbar.jsx` logout to use `useAuth`**

```jsx
import { useAuth } from '../context/AuthContext';
// inside component:
const { logout } = useAuth();
// replace onClick: logout(); navigate('/login');
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/context/AuthContext.jsx frontend/src/App.jsx frontend/src/pages/Login.jsx frontend/src/components/RecruiterNavbar.jsx
git commit -m "feat: add AuthContext with ProtectedRoute and AdminRoute"
```

---

### Task 6: Backend — Form Request classes

**Files:**
- Create: `app/Http/Requests/StoreJobOfferRequest.php`
- Create: `app/Http/Requests/UpdateJobOfferRequest.php`
- Create: `app/Http/Requests/ApplyToJobRequest.php`
- Create: `app/Http/Requests/StoreNoteRequest.php`
- Create: `app/Http/Requests/MoveApplicationRequest.php`

- [ ] **Step 1: Create `app/Http/Requests/StoreJobOfferRequest.php`**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:50',
            'description' => 'required|string',
            'status'      => 'nullable|string|in:draft,active,archived',
        ];
    }
}
```

- [ ] **Step 2: Create `app/Http/Requests/UpdateJobOfferRequest.php`**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:50',
            'description' => 'required|string',
            'status'      => 'required|string|in:draft,active,archived',
        ];
    }
}
```

- [ ] **Step 3: Create `app/Http/Requests/ApplyToJobRequest.php`**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ApplyToJobRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:20',
            'last_name'  => 'required|string|max:20',
            'email'      => 'required|email',
            'phone'      => 'required|string|max:20',
            'resume'     => 'required|file|mimes:pdf|max:2048',
        ];
    }
}
```

- [ ] **Step 4: Create `app/Http/Requests/StoreNoteRequest.php`**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'content' => 'required|string',
        ];
    }
}
```

- [ ] **Step 5: Create `app/Http/Requests/MoveApplicationRequest.php`**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class MoveApplicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'       => 'required|string|in:screening,interview,technical,hired,rejected',
            'kanban_order' => 'required|integer|min:0',
        ];
    }
}
```

- [ ] **Step 6: Apply Form Requests in `JobOfferController.php`**

```php
use App\Http\Requests\StoreJobOfferRequest;
use App\Http\Requests\UpdateJobOfferRequest;

// store():
public function store(StoreJobOfferRequest $request) { ... }

// update():
public function update(UpdateJobOfferRequest $request, $id) { ... }
```

- [ ] **Step 7: Apply in `ApplicationController.php`**

```php
use App\Http\Requests\MoveApplicationRequest;

public function move(MoveApplicationRequest $request, $id) {
    $application = $this->applicationService->moveApplication(
        $id, $request->user()->company_id, $request->validated()
    );
    // ...
}
```

- [ ] **Step 8: Apply in `NoteController.php`**

```php
use App\Http\Requests\StoreNoteRequest;

public function store(StoreNoteRequest $request, $applicationId) {
    // replace $request->validate([...]) with $request->validated()
}
```

- [ ] **Step 9: Apply in `PublicJobController.php`**

```php
use App\Http\Requests\ApplyToJobRequest;

public function apply(ApplyToJobRequest $request, $id) {
    // replace $request->validate([...]) with $request->validated()
}
```

- [ ] **Step 10: Commit**

```bash
git add app/Http/Requests/ app/Http/Controllers/
git commit -m "refactor: extract Form Request classes for validation"
```

---

### Task 7: Backend — API Resource classes

**Files:**
- Create: `app/Http/Resources/JobOfferResource.php`
- Create: `app/Http/Resources/ApplicationResource.php`
- Create: `app/Http/Resources/CandidateResource.php`
- Create: `app/Http/Resources/NoteResource.php`

- [ ] **Step 1: Create `app/Http/Resources/JobOfferResource.php`**

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class JobOfferResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'title'              => $this->title,
            'description'        => $this->description,
            'status'             => $this->status,
            'company_id'         => $this->company_id,
            'created_by'         => $this->created_by,
            'applications_count' => $this->applications_count ?? 0,
            'tags'               => $this->whenLoaded('tags', fn() =>
                $this->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color])
            ),
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
```

- [ ] **Step 2: Create `app/Http/Resources/CandidateResource.php`**

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'first_name'  => $this->first_name,
            'last_name'   => $this->last_name,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'resume_path' => $this->resume_path,
        ];
    }
}
```

- [ ] **Step 3: Create `app/Http/Resources/ApplicationResource.php`**

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'kanban_order' => $this->kanban_order,
            'candidate'    => new CandidateResource($this->whenLoaded('candidate')),
            'job_offer'    => $this->whenLoaded('jobOffer', fn() => [
                'id'    => $this->jobOffer->id,
                'title' => $this->jobOffer->title,
            ]),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
```

- [ ] **Step 4: Create `app/Http/Resources/NoteResource.php`**

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'content'        => $this->content,
            'user_id'        => $this->user_id,
            'application_id' => $this->application_id,
            'user'           => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at'     => $this->created_at,
        ];
    }
}
```

- [ ] **Step 5: Apply Resources in `JobOfferController.php`**

```php
use App\Http\Resources\JobOfferResource;

// index(): return JobOfferResource::collection($jobOffers);
// store(): return new JobOfferResource($jobOffer);
// show():  return new JobOfferResource($jobOffer);
// update(): return new JobOfferResource($jobOffer);
```

- [ ] **Step 6: Apply Resources in `NoteController.php`**

```php
use App\Http\Resources\NoteResource;

// index(): return NoteResource::collection($notes);
// store(): return new NoteResource($note);
```

- [ ] **Step 7: Commit**

```bash
git add app/Http/Resources/ app/Http/Controllers/
git commit -m "refactor: add API Resource classes for consistent JSON responses"
```

---

### Task 8: Backend — ScopedByCompany model scope

**Files:**
- Modify: `app/Models/JobOffer.php`
- Modify: `app/Models/Application.php`

- [ ] **Step 1: Add `scopeForCompany` to `JobOffer.php`**

```php
public function scopeForCompany($query, int $companyId)
{
    return $query->where('company_id', $companyId);
}
```

- [ ] **Step 2: Update `JobOfferController.php` to use the scope**

```php
// index:
JobOffer::forCompany($request->user()->company_id)->withCount('applications')->get();

// show:
JobOffer::forCompany($request->user()->company_id)->withCount('applications')->findOrFail($id);

// update/destroy:
JobOffer::forCompany($request->user()->company_id)->findOrFail($id);
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/JobOffer.php app/Http/Controllers/JobOfferController.php
git commit -m "refactor: add scopeForCompany on JobOffer, apply in controller"
```

---

## Phase 2 — Bug Fixes & Security

---

### Task 9: Fix Kanban same-column reorder bug

**Files:**
- Modify: `frontend/src/pages/KanbanBoard.jsx`
- Modify: `routes/api.php`
- Create: backend reorder endpoint in `ApplicationController.php`

- [ ] **Step 1: Add `reorder` action to `ApplicationController.php`**

```php
public function reorder(Request $request)
{
    $validated = $request->validate([
        'applications'               => 'required|array',
        'applications.*.id'          => 'required|integer',
        'applications.*.status'      => 'required|string|in:screening,interview,technical,hired,rejected',
        'applications.*.kanban_order'=> 'required|integer|min:0',
    ]);

    foreach ($validated['applications'] as $item) {
        $application = $this->applicationService->moveApplication(
            $item['id'],
            $request->user()->company_id,
            ['status' => $item['status'], 'kanban_order' => $item['kanban_order']]
        );
        if (!$application) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
    }

    return response()->json(['message' => 'Reordered']);
}
```

- [ ] **Step 2: Register route in `routes/api.php`**

```php
Route::put('/applications/reorder', [ApplicationController::class, 'reorder']);
```

Add this **before** `Route::put('/applications/{id}/move', ...)` to avoid route conflict.

- [ ] **Step 3: Fix `onDragEnd` in `KanbanBoard.jsx`**

Replace the entire `onDragEnd` function with:

```js
const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedId = parseInt(draggableId);
    const sourceCol = applications
        .filter(a => a.status === source.droppableId)
        .sort((a, b) => a.kanban_order - b.kanban_order);
    const destCol = source.droppableId === destination.droppableId
        ? sourceCol
        : applications
            .filter(a => a.status === destination.droppableId)
            .sort((a, b) => a.kanban_order - b.kanban_order);

    // Remove dragged card from source position
    const [moved] = sourceCol.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
        // Same column reorder
        sourceCol.splice(destination.index, 0, moved);
        const updates = sourceCol.map((app, i) => ({
            ...app,
            kanban_order: i,
        }));
        setApplications(prev =>
            prev.map(a => {
                const u = updates.find(u => u.id === a.id);
                return u ? { ...a, kanban_order: u.kanban_order } : a;
            })
        );
        const payload = updates.map(a => ({ id: a.id, status: a.status, kanban_order: a.kanban_order }));
        api.put('/applications/reorder', { applications: payload }).catch(() => {
            // rollback on error: re-fetch
            api.get(`/job-offers/${id}/applications`).then(r => setApplications(r.data));
        });
    } else {
        // Cross-column move
        const destColMutable = applications
            .filter(a => a.status === destination.droppableId && a.id !== draggedId)
            .sort((a, b) => a.kanban_order - b.kanban_order);
        const movedWithNewStatus = { ...moved, status: destination.droppableId };
        destColMutable.splice(destination.index, 0, movedWithNewStatus);

        const srcUpdates = sourceCol.map((app, i) => ({ id: app.id, status: app.status, kanban_order: i }));
        const dstUpdates = destColMutable.map((app, i) => ({ id: app.id, status: destination.droppableId, kanban_order: i }));

        setApplications(prev =>
            prev.map(a => {
                const u = [...srcUpdates, ...dstUpdates].find(u => u.id === a.id);
                return u ? { ...a, status: u.status, kanban_order: u.kanban_order } : a;
            })
        );
        api.put('/applications/reorder', { applications: [...srcUpdates, ...dstUpdates] }).catch(() => {
            api.get(`/job-offers/${id}/applications`).then(r => setApplications(r.data));
        });
    }
};
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/ApplicationController.php routes/api.php frontend/src/pages/KanbanBoard.jsx
git commit -m "fix: correct Kanban reorder — update all cards in column on drag, batch persist"
```

---

### Task 10: Lock CORS and add rate limiting

**Files:**
- Modify: `config/cors.php`
- Modify: `bootstrap/app.php`
- Modify: `.env.example`

- [ ] **Step 1: Update `config/cors.php`**

```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'supports_credentials' => true,
```

- [ ] **Step 2: Add `FRONTEND_URL` to `.env.example`**

```
FRONTEND_URL=http://localhost:5173
```

Also add to your local `.env`:
```
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 3: Add rate limiting in `bootstrap/app.php`**

Inside `->withMiddleware(function (Middleware $middleware) {`:

```php
$middleware->throttleApi(); // keeps default 60/min for api group

// Or add custom limits per route group in routes/api.php:
```

In `routes/api.php`, add throttle middleware to specific routes:

```php
// At top of file, before route definitions:
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/public/jobs/{id}/apply', [PublicJobController::class, 'apply']);
});
```

Remove the original `Route::post('/register', ...)` and `Route::post('/login', ...)` standalone lines and the `/public/jobs/{id}/apply` line, since they are now in the throttled groups.

- [ ] **Step 4: Commit**

```bash
git add config/cors.php bootstrap/app.php routes/api.php .env.example
git commit -m "security: restrict CORS to FRONTEND_URL, add rate limiting on auth and apply routes"
```

---

### Task 11: Add invite token expiration

**Files:**
- Create: migration `add_expires_at_to_invitations_table.php`
- Modify: `app/Services/AuthService.php`
- Modify: `app/Http/Controllers/Auth/AuthController.php`

- [ ] **Step 1: Create migration**

```bash
cd /path/to/project && php artisan make:migration add_expires_at_to_invitations_table
```

Edit the generated file:

```php
public function up(): void
{
    Schema::table('invitations', function (Blueprint $table) {
        $table->timestamp('expires_at')->nullable()->after('token');
    });
}

public function down(): void
{
    Schema::table('invitations', function (Blueprint $table) {
        $table->dropColumn('expires_at');
    });
}
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate
```

- [ ] **Step 3: Update `AuthService.php` to set `expires_at` on invite**

```php
$invitation = Invitation::create([
    'company_id' => $companyId,
    'email'      => $email,
    'token'      => $token,
    'expires_at' => now()->addHours(48),
]);
```

- [ ] **Step 4: Update `AuthController.php` to reject expired invites**

```php
$invitation = $this->authService->findInvitation($request->invite_token);

if (!$invitation) {
    return response()->json(['message' => 'Invalid invite link'], 400);
}

if ($invitation->expires_at && $invitation->expires_at->isPast()) {
    return response()->json(['message' => 'This invite link has expired'], 400);
}
```

- [ ] **Step 5: Commit**

```bash
git add database/migrations/ app/Services/AuthService.php app/Http/Controllers/Auth/AuthController.php
git commit -m "feat: add 48h expiration to invitation tokens"
```

---

### Task 12: Create Toast component and replace all alert() calls

**Files:**
- Create: `frontend/src/components/Toast.jsx`
- Modify: `frontend/src/components/RecruiterNavbar.jsx` (already fixed in Task 3)
- Modify: `frontend/src/pages/JobDetails.jsx`
- Modify: `frontend/src/pages/AdminDashboard.jsx`
- Modify: `frontend/src/pages/KanbanBoard.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Create `frontend/src/components/Toast.jsx`**

```jsx
import { useEffect, useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const show = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    return { toasts, show };
}

export function ToastContainer({ toasts }) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs transition-all duration-300 ${
                        toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
                    }`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Add Toast to `Dashboard.jsx`**

```jsx
import { useToast, ToastContainer } from '../components/Toast';

function Dashboard() {
    const { toasts, show: showToast } = useToast();
    // ...
    return (
        <div>
            <ToastContainer toasts={toasts} />
            {/* rest of JSX */}
        </div>
    );
}
```

- [ ] **Step 3: Update `JobDetails.jsx` to replace `window.confirm` + `alert`**

Replace `handleDelete`:

```jsx
import { useToast, ToastContainer } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog'; // created in Task 18

const { toasts, show: showToast } = useToast();
const [confirmOpen, setConfirmOpen] = useState(false);

const handleDelete = () => setConfirmOpen(true);

const confirmDelete = () => {
    api.delete(`/job-offers/${id}`)
        .then(() => navigate('/job-offers'))
        .catch(() => showToast('Failed to delete job offer', 'error'));
};
```

For now (before Task 18 ConfirmDialog exists), replace `window.confirm` with a simple inline state approach or skip ConfirmDialog import until Task 18.

- [ ] **Step 4: Update `AdminDashboard.jsx`** — replace both `window.confirm` + handle errors with `showToast`.

Replace `deleteCompany` and `deleteUser` bodies:

```jsx
const { toasts, show: showToast } = useToast();
const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingAction, setPendingAction] = useState(null);

const deleteCompany = (id) => {
    setPendingAction(() => () => {
        api.delete(`/admin/companies/${id}`)
            .then(() => setCompanies(prev => prev.filter(c => c.id !== id)))
            .catch(() => showToast('Failed to delete company', 'error'));
    });
    setConfirmOpen(true);
};

const deleteUser = (id) => {
    setPendingAction(() => () => {
        api.delete(`/admin/users/${id}`)
            .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
            .catch(() => showToast('Failed to delete user', 'error'));
    });
    setConfirmOpen(true);
};
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Toast.jsx frontend/src/pages/
git commit -m "feat: add Toast component, replace alert() calls with toast notifications"
```

---

## Phase 3 — Complete the Tags System

---

### Task 13: Backend — TagController and routes

**Files:**
- Create: `app/Http/Controllers/TagController.php`
- Modify: `routes/api.php`
- Modify: `app/Http/Controllers/JobOfferController.php` (eager-load tags)

- [ ] **Step 1: Create `app/Http/Controllers/TagController.php`**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $tags = Tag::where('company_id', $request->user()->company_id)->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:30',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag = Tag::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
        ]));

        return response()->json($tag, 201);
    }

    public function update(Request $request, $id)
    {
        $tag = Tag::where('company_id', $request->user()->company_id)->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'required|string|max:30',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag->update($validated);
        return response()->json($tag);
    }

    public function destroy(Request $request, $id)
    {
        $tag = Tag::where('company_id', $request->user()->company_id)->findOrFail($id);
        $tag->jobOffers()->detach();
        $tag->delete();
        return response()->json(['message' => 'Tag deleted']);
    }

    public function attachToJob(Request $request, $jobId)
    {
        $jobOffer = \App\Models\JobOffer::forCompany($request->user()->company_id)->findOrFail($jobId);
        $validated = $request->validate(['tag_ids' => 'required|array', 'tag_ids.*' => 'integer']);
        $jobOffer->tags()->sync($validated['tag_ids']);
        return response()->json($jobOffer->load('tags'));
    }

    public function detachFromJob(Request $request, $jobId, $tagId)
    {
        $jobOffer = \App\Models\JobOffer::forCompany($request->user()->company_id)->findOrFail($jobId);
        $jobOffer->tags()->detach($tagId);
        return response()->json(['message' => 'Tag removed']);
    }
}
```

- [ ] **Step 2: Add tag routes in `routes/api.php`** (inside the `auth:sanctum` middleware group)

```php
use App\Http\Controllers\TagController;

Route::get('/tags', [TagController::class, 'index']);
Route::post('/tags', [TagController::class, 'store']);
Route::put('/tags/{id}', [TagController::class, 'update']);
Route::delete('/tags/{id}', [TagController::class, 'destroy']);
Route::post('/job-offers/{id}/tags', [TagController::class, 'attachToJob']);
Route::delete('/job-offers/{id}/tags/{tagId}', [TagController::class, 'detachFromJob']);
```

- [ ] **Step 3: Eager-load tags in `JobOfferController.php`**

```php
// index():
$jobOffers = JobOffer::forCompany($request->user()->company_id)
    ->withCount('applications')
    ->with('tags')
    ->get();

// show():
$jobOffer = JobOffer::forCompany($request->user()->company_id)
    ->withCount('applications')
    ->with('tags')
    ->findOrFail($id);
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/TagController.php routes/api.php app/Http/Controllers/JobOfferController.php
git commit -m "feat: add TagController with full CRUD and job-offer attachment endpoints"
```

---

### Task 14: Frontend — Tag management and job form tag picker

**Files:**
- Create: `frontend/src/pages/TagManager.jsx`
- Modify: `frontend/src/pages/CreateJob.jsx`
- Modify: `frontend/src/pages/EditJob.jsx`
- Modify: `frontend/src/pages/JobOffers.jsx`

- [ ] **Step 1: Create `frontend/src/pages/TagManager.jsx`**

```jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

function TagManager({ onClose }) {
    const [tags, setTags] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');

    useEffect(() => {
        api.get('/tags').then(r => setTags(r.data));
    }, []);

    const createTag = () => {
        if (!name.trim()) return;
        api.post('/tags', { name, color }).then(r => {
            setTags(prev => [...prev, r.data]);
            setName('');
        });
    };

    const deleteTag = (id) => {
        api.delete(`/tags/${id}`).then(() => setTags(prev => prev.filter(t => t.id !== id)));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900">Manage Tags</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black text-xs">Close</button>
                </div>
                <div className="flex gap-2 mb-4">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Tag name"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                    <button onClick={createTag}
                        className="px-3 py-2 bg-black text-white rounded-lg text-sm font-semibold">
                        Add
                    </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tags.map(tag => (
                        <div key={tag.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                            </div>
                            <button onClick={() => deleteTag(tag.id)}
                                className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TagManager;
```

- [ ] **Step 2: Add tag picker to `CreateJob.jsx`**

Add state and fetch:
```jsx
import TagManager from './TagManager';
const [tags, setTags] = useState([]);
const [selectedTagIds, setSelectedTagIds] = useState([]);
const [showTagManager, setShowTagManager] = useState(false);

useEffect(() => {
    api.get('/tags').then(r => setTags(r.data));
}, []);
```

In `handleSubmit`, after creating the job offer, attach tags:
```jsx
axios.post('http://localhost:8000/api/job-offers', { title, description, status }, ...)
    .then(response => {
        if (selectedTagIds.length > 0) {
            return api.post(`/job-offers/${response.data.id}/tags`, { tag_ids: selectedTagIds });
        }
    })
    .then(() => navigate('/job-offers'))
```

Add the tag picker UI below the description textarea:
```jsx
{/* Tags */}
<div className="mt-8">
    <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Tags</label>
        <button type="button" onClick={() => setShowTagManager(true)}
            className="text-xs text-gray-400 hover:text-black">Manage tags</button>
    </div>
    <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
            <button
                type="button"
                key={tag.id}
                onClick={() => setSelectedTagIds(prev =>
                    prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                )}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedTagIds.includes(tag.id)
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-500 bg-white'
                }`}
                style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
            >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTagIds.includes(tag.id) ? 'white' : tag.color }} />
                {tag.name}
            </button>
        ))}
    </div>
</div>
{showTagManager && <TagManager onClose={() => { setShowTagManager(false); api.get('/tags').then(r => setTags(r.data)); }} />}
```

- [ ] **Step 3: Add tag picker to `EditJob.jsx`**

Add same state/fetch as CreateJob. Load existing tag IDs from the job offer response:
```jsx
// in the .then() of the job fetch:
setSelectedTagIds(response.data.tags?.map(t => t.id) || []);
```

In `handleSubmit`, after updating:
```jsx
api.put(`/job-offers/${id}`, { title, description, status })
    .then(() => api.post(`/job-offers/${id}/tags`, { tag_ids: selectedTagIds }))
    .then(() => navigate('/job-offers'))
```

Add the same tag picker UI as in CreateJob.

- [ ] **Step 4: Show tag pills on `JobOffers.jsx` job cards**

Inside each job card (after the "Applications" info pill):
```jsx
{job.tags && job.tags.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-1">
        {job.tags.map(tag => (
            <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
            >
                {tag.name}
            </span>
        ))}
    </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TagManager.jsx frontend/src/pages/CreateJob.jsx frontend/src/pages/EditJob.jsx frontend/src/pages/JobOffers.jsx
git commit -m "feat: complete tags system — management UI, job form picker, tag pills on job cards"
```

---

## Phase 4 — New Features

---

### Task 15: Activity log — migration, model, and controller

**Files:**
- Create: migration for `activities` table
- Create: `app/Models/Activity.php`
- Create: `app/Http/Controllers/ActivityController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create migration**

```bash
php artisan make:migration create_activities_table
```

Edit the generated file:

```php
public function up(): void
{
    Schema::create('activities', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('company_id');
        $table->unsignedBigInteger('user_id')->nullable();
        $table->string('type'); // 'application_created', 'status_changed', 'note_added'
        $table->string('subject_type');
        $table->unsignedBigInteger('subject_id');
        $table->string('description');
        $table->json('metadata')->nullable();
        $table->timestamp('created_at')->useCurrent();

        $table->index('company_id');
        $table->index(['subject_type', 'subject_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('activities');
}
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate
```

- [ ] **Step 3: Create `app/Models/Activity.php`**

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    public $timestamps = false;
    protected $fillable = ['company_id', 'user_id', 'type', 'subject_type', 'subject_id', 'description', 'metadata'];
    protected $casts = ['metadata' => 'array', 'created_at' => 'datetime'];

    public static function log(int $companyId, ?int $userId, string $type, string $subjectType, int $subjectId, string $description, array $metadata = []): void
    {
        static::create([
            'company_id'   => $companyId,
            'user_id'      => $userId,
            'type'         => $type,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'description'  => $description,
            'metadata'     => $metadata ?: null,
        ]);
    }
}
```

- [ ] **Step 4: Log activity in `PublicJobController@apply`**

```php
use App\Models\Activity;

// after Application::create([...]):
Activity::log(
    $job->company_id,
    null,
    'application_created',
    'application',
    $application->id,
    "{$candidate->first_name} {$candidate->last_name} applied to {$job->title}"
);
```

- [ ] **Step 5: Log activity in `ApplicationController@move`**

In `ApplicationService::moveApplication`, after `$application->update($validated)`:

```php
// Pass userId through to service, or log in controller:
```

In `ApplicationController@move`, after the service call:
```php
if ($application) {
    Activity::log(
        $request->user()->company_id,
        $request->user()->id,
        'status_changed',
        'application',
        $application->id,
        "{$request->user()->name} moved to {$validated['status']}"
    );
}
```

- [ ] **Step 6: Log activity in `NoteController@store`**

```php
Activity::log(
    $request->user()->company_id,
    $request->user()->id,
    'note_added',
    'application',
    $application->id,
    "{$request->user()->name} added a note"
);
```

- [ ] **Step 7: Create `app/Http/Controllers/ActivityController.php`**

```php
<?php
namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $activities = Activity::where('company_id', $request->user()->company_id)
            ->orderByDesc('created_at')
            ->take(20)
            ->get();

        return response()->json($activities);
    }
}
```

- [ ] **Step 8: Add activity route in `routes/api.php`**

```php
use App\Http\Controllers\ActivityController;

Route::get('/activities', [ActivityController::class, 'index']);
```

- [ ] **Step 9: Commit**

```bash
git add database/migrations/ app/Models/Activity.php app/Http/Controllers/ActivityController.php app/Http/Controllers/ApplicationController.php app/Http/Controllers/NoteController.php app/Http/Controllers/PublicJobController.php routes/api.php
git commit -m "feat: add activity log — table, model, log on apply/move/note, controller endpoint"
```

---

### Task 16: Dashboard — activity feed + enhanced analytics

**Files:**
- Modify: `app/Services/DashboardService.php`
- Modify: `app/Http/Controllers/DashboardController.php`
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Install recharts**

```bash
cd frontend && npm install recharts
```

- [ ] **Step 2: Enhance `DashboardService.php`**

Add new stats to `getStats()`:

```php
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// Time-to-hire average (days from created_at to updated_at when status=hired)
$timeToHire = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
    ->where('status', 'hired')
    ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
    ->value('avg_days');

// Applications this week vs last week
$thisWeek = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
    ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
    ->count();

$lastWeek = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
    ->whereBetween('created_at', [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()])
    ->count();

$weeklyDelta = $lastWeek > 0 ? round((($thisWeek - $lastWeek) / $lastWeek) * 100) : ($thisWeek > 0 ? 100 : 0);

// Conversion rate
$conversionRate = $totalApplications > 0
    ? round(($hiredCount / $totalApplications) * 100, 1)
    : 0;

// Last 14 days trend
$trend = collect(range(13, 0))->map(function ($daysAgo) use ($companyId) {
    $date = Carbon::now()->subDays($daysAgo)->toDateString();
    $count = Application::whereHas('jobOffer', fn($q) => $q->where('company_id', $companyId))
        ->whereDate('created_at', $date)
        ->count();
    return ['date' => $date, 'count' => $count];
});
```

Add these to the returned array:
```php
'time_to_hire'    => $timeToHire ? round($timeToHire, 1) : null,
'this_week'       => $thisWeek,
'weekly_delta'    => $weeklyDelta,
'conversion_rate' => $conversionRate,
'trend'           => $trend,
```

- [ ] **Step 3: Update `Dashboard.jsx` — add activity feed and trend chart**

Add new stat cards after existing 4 cards:

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

// In useEffect, fetch activities:
const [activities, setActivities] = useState([]);
useEffect(() => {
    api.get('/dashboard').then(r => { setStats(r.data); setLoading(false); });
    api.get('/activities').then(r => setActivities(r.data));
}, []);
```

Replace the "Recent Applications" section with an activity feed:

```jsx
{/* Activity Feed */}
<div className="mt-8">
    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
    {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-10 text-center text-sm text-gray-400">
            No activity yet.
        </div>
    ) : (
        <div className="space-y-2">
            {activities.map(act => (
                <div key={act.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{act.description}</span>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                        {new Date(act.created_at).toLocaleDateString()}
                    </span>
                </div>
            ))}
        </div>
    )}
</div>
```

Add trend chart below Pipeline Overview:
```jsx
{/* 14-Day Trend */}
{stats.trend && (
    <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Applications — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={120}>
            <LineChart data={stats.trend}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                    formatter={(v) => [v, 'Applications']}
                    labelFormatter={(l) => new Date(l).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="count" stroke="#0a0a0a" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
)}
```

Add new stat cards for `weekly_delta`, `conversion_rate`, `time_to_hire`.

- [ ] **Step 4: Commit**

```bash
git add app/Services/DashboardService.php frontend/src/pages/Dashboard.jsx
git commit -m "feat: enhanced dashboard — activity feed, 14-day trend chart, conversion rate stats"
```

---

### Task 17: Kanban bulk actions and advanced filters

**Files:**
- Modify: `frontend/src/pages/KanbanBoard.jsx`

- [ ] **Step 1: Add bulk selection state**

```jsx
const [selectedIds, setSelectedIds] = useState(new Set());
const [bulkStatus, setBulkStatus] = useState('');

const toggleSelect = (id) => {
    setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
};
```

- [ ] **Step 2: Add checkbox to each Kanban card**

At the very start of the card content div (before `{/* Card top */}`):
```jsx
<div className="flex items-center gap-2 mb-2">
    <input
        type="checkbox"
        checked={selectedIds.has(app.id)}
        onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
        onClick={(e) => e.stopPropagation()}
        className="w-3.5 h-3.5 rounded accent-black cursor-pointer"
    />
</div>
```

- [ ] **Step 3: Add floating bulk action bar**

After the `</DragDropContext>` closing tag, before the side panel:

```jsx
{selectedIds.size > 0 && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4">
        <span className="text-sm font-semibold">{selectedIds.size} selected</span>
        <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:outline-none"
        >
            <option value="">Move to...</option>
            {['screening','interview','technical','hired','rejected'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
        </select>
        <button
            onClick={() => {
                if (!bulkStatus) return;
                const updates = [...selectedIds].map((appId, i) => ({
                    id: appId,
                    status: bulkStatus,
                    kanban_order: i,
                }));
                setApplications(prev => prev.map(a =>
                    selectedIds.has(a.id) ? { ...a, status: bulkStatus } : a
                ));
                api.put('/applications/reorder', { applications: updates });
                setSelectedIds(new Set());
                setBulkStatus('');
            }}
            disabled={!bulkStatus}
            className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-40"
        >
            Apply
        </button>
        <button
            onClick={() => {
                if (!window.confirm(`Delete ${selectedIds.size} application(s)?`)) return;
                const ids = [...selectedIds];
                Promise.all(ids.map(appId => api.delete(`/applications/${appId}`))).then(() => {
                    setApplications(prev => prev.filter(a => !selectedIds.has(a.id)));
                    setSelectedIds(new Set());
                });
            }}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
        >
            Delete
        </button>
        <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-white text-sm">
            Deselect all
        </button>
    </div>
)}
```

- [ ] **Step 4: Enhance search to match email too**

In `getByStatus`, update the filter condition:
```js
const fullName = applications[i].candidate.first_name + ' ' + applications[i].candidate.last_name;
const emailMatch = applications[i].candidate.email?.toLowerCase().includes(searchQuery.toLowerCase());
const nameMatch = fullName.toLowerCase().includes(searchQuery.toLowerCase());

if (applications[i].status === status && (nameMatch || emailMatch)) {
    results.push(applications[i]);
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/KanbanBoard.jsx
git commit -m "feat: Kanban bulk actions (move/delete selected), email search, column reorder fix"
```

---

### Task 18: Confirmation dialog component

**Files:**
- Create: `frontend/src/components/ConfirmDialog.jsx`
- Modify: `frontend/src/pages/JobDetails.jsx`
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Create `frontend/src/components/ConfirmDialog.jsx`**

```jsx
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-gray-800'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
```

- [ ] **Step 2: Use in `JobDetails.jsx`**

```jsx
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast, ToastContainer } from '../components/Toast';

const { toasts, show: showToast } = useToast();
const [confirmOpen, setConfirmOpen] = useState(false);

const handleDelete = () => setConfirmOpen(true);

const confirmDelete = () => {
    setConfirmOpen(false);
    api.delete(`/job-offers/${id}`)
        .then(() => navigate('/job-offers'))
        .catch(() => showToast('Failed to delete job offer', 'error'));
};

// In JSX:
<ToastContainer toasts={toasts} />
<ConfirmDialog
    open={confirmOpen}
    title="Delete Job Offer"
    message="This will permanently delete the job offer and all associated applications. This cannot be undone."
    onConfirm={confirmDelete}
    onCancel={() => setConfirmOpen(false)}
    confirmLabel="Delete"
    danger
/>
```

Remove the `window.confirm` from both `handleDelete` usages in `JobDetails.jsx`.

- [ ] **Step 3: Use in `AdminDashboard.jsx`**

```jsx
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast, ToastContainer } from '../components/Toast';

const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingAction, setPendingAction] = useState(null);
const [confirmMessage, setConfirmMessage] = useState('');
const { toasts, show: showToast } = useToast();

const promptDelete = (message, action) => {
    setConfirmMessage(message);
    setPendingAction(() => action);
    setConfirmOpen(true);
};

const deleteCompany = (id) => promptDelete(
    'Delete this company and all its data?',
    () => api.delete(`/admin/companies/${id}`)
        .then(() => setCompanies(prev => prev.filter(c => c.id !== id)))
        .catch(() => showToast('Failed to delete', 'error'))
);

const deleteUser = (id) => promptDelete(
    'Delete this user?',
    () => api.delete(`/admin/users/${id}`)
        .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
        .catch(() => showToast('Failed to delete', 'error'))
);

// In JSX:
<ToastContainer toasts={toasts} />
<ConfirmDialog
    open={confirmOpen}
    title="Confirm Delete"
    message={confirmMessage}
    onConfirm={() => { setConfirmOpen(false); pendingAction?.(); }}
    onCancel={() => setConfirmOpen(false)}
    confirmLabel="Delete"
    danger
/>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ConfirmDialog.jsx frontend/src/pages/JobDetails.jsx frontend/src/pages/AdminDashboard.jsx
git commit -m "feat: add ConfirmDialog component, replace window.confirm() in JobDetails and AdminDashboard"
```

---

### Task 19: Email notification for new applications

**Files:**
- Create: `app/Mail/NewApplicationNotification.php`
- Modify: `app/Http/Controllers/PublicJobController.php`

- [ ] **Step 1: Create `app/Mail/NewApplicationNotification.php`**

```php
<?php
namespace App\Mail;

use App\Models\Application;
use App\Models\JobOffer;
use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewApplicationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Candidate $candidate,
        public JobOffer $jobOffer,
        public Application $application
    ) {}

    public function build(): self
    {
        $pipelineUrl = env('FRONTEND_URL', 'http://localhost:5173')
            . '/job-offers/' . $this->jobOffer->id . '/pipeline';

        return $this->subject("New Application: {$this->candidate->first_name} {$this->candidate->last_name} applied to {$this->jobOffer->title}")
            ->html(
                '<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">'
                . '<h2 style="color:#0a0a0a;">New Application Received</h2>'
                . "<p><strong>{$this->candidate->first_name} {$this->candidate->last_name}</strong> ({$this->candidate->email}) has applied to <strong>{$this->jobOffer->title}</strong>.</p>"
                . "<a href=\"{$pipelineUrl}\" style=\"display:inline-block;margin-top:16px;padding:12px 24px;background:#0a0a0a;color:white;border-radius:8px;text-decoration:none;font-weight:600;\">View in Pipeline</a>"
                . '</div>'
            );
    }
}
```

- [ ] **Step 2: Update `PublicJobController@apply` to queue the notification**

```php
use App\Mail\NewApplicationNotification;
use Illuminate\Support\Facades\Mail;

// After Application::create([...]) and Activity::log(...):
$recruiter = $job->creator;
if ($recruiter && $recruiter->email) {
    Mail::to($recruiter->email)
        ->queue(new NewApplicationNotification($candidate, $job, $application));
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Mail/NewApplicationNotification.php app/Http/Controllers/PublicJobController.php
git commit -m "feat: send queued email to recruiter when new application is submitted"
```

---

## Phase 5 — Polish

---

### Task 20: Skeleton loader component and loading states

**Files:**
- Create: `frontend/src/components/Skeleton.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx`
- Modify: `frontend/src/pages/JobOffers.jsx`
- Modify: `frontend/src/pages/KanbanBoard.jsx`

- [ ] **Step 1: Create `frontend/src/components/Skeleton.jsx`**

```jsx
export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
        </div>
    );
}

export function SkeletonStatCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-16" />
        </div>
    );
}
```

- [ ] **Step 2: Replace "Loading..." in `Dashboard.jsx`**

```jsx
import { Skeleton, SkeletonStatCard, SkeletonCard } from '../components/Skeleton';

// Replace:
// <span className="text-gray-400 text-sm">Loading...</span>
// With:
{loading ? (
    <>
        <div className="grid grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="mt-8 space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
    </>
) : ( /* existing content */ )}
```

- [ ] **Step 3: Replace "Loading..." in `JobOffers.jsx`**

Wrap `filteredJobs.length === 0` check: show skeleton grid while loading:

```jsx
{loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
) : filteredJobs.length === 0 ? (
    /* existing empty state */
) : (
    /* existing grid */
)}
```

Add `const [loading, setLoading] = useState(true);` and set it to `false` in the `.then()`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Skeleton.jsx frontend/src/pages/Dashboard.jsx frontend/src/pages/JobOffers.jsx
git commit -m "feat: add Skeleton component, replace text loading states with skeleton loaders"
```

---

## Phase 6 — Backend Hardening

---

### Task 21: Database indexes migration

**Files:**
- Create: migration `add_database_indexes.php`

- [ ] **Step 1: Create migration**

```bash
php artisan make:migration add_database_indexes
```

Edit the generated file:

```php
public function up(): void
{
    Schema::table('job_offers', function (Blueprint $table) {
        $table->index('company_id');
        $table->index('status');
    });

    Schema::table('applications', function (Blueprint $table) {
        $table->index('job_offer_id');
        $table->index('status');
        $table->index('candidate_id');
    });

    Schema::table('notes', function (Blueprint $table) {
        $table->index('application_id');
    });

    Schema::table('candidates', function (Blueprint $table) {
        $table->index('email');
    });
}

public function down(): void
{
    Schema::table('job_offers', function (Blueprint $table) {
        $table->dropIndex(['company_id']);
        $table->dropIndex(['status']);
    });
    Schema::table('applications', function (Blueprint $table) {
        $table->dropIndex(['job_offer_id']);
        $table->dropIndex(['status']);
        $table->dropIndex(['candidate_id']);
    });
    Schema::table('notes', function (Blueprint $table) {
        $table->dropIndex(['application_id']);
    });
    Schema::table('candidates', function (Blueprint $table) {
        $table->dropIndex(['email']);
    });
}
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate
```

- [ ] **Step 3: Commit**

```bash
git add database/migrations/
git commit -m "perf: add database indexes on company_id, status, job_offer_id, candidate email"
```

---

### Task 22: Add soft deletes

**Files:**
- Create: migration `add_soft_deletes.php`
- Modify: `app/Models/JobOffer.php`
- Modify: `app/Models/Application.php`
- Modify: `app/Models/Company.php`

- [ ] **Step 1: Create migration**

```bash
php artisan make:migration add_soft_deletes_to_tables
```

```php
public function up(): void
{
    Schema::table('job_offers',   fn(Blueprint $t) => $t->softDeletes());
    Schema::table('applications', fn(Blueprint $t) => $t->softDeletes());
    Schema::table('companies',    fn(Blueprint $t) => $t->softDeletes());
}

public function down(): void
{
    Schema::table('job_offers',   fn(Blueprint $t) => $t->dropSoftDeletes());
    Schema::table('applications', fn(Blueprint $t) => $t->dropSoftDeletes());
    Schema::table('companies',    fn(Blueprint $t) => $t->dropSoftDeletes());
}
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate
```

- [ ] **Step 3: Add `SoftDeletes` to models**

In `JobOffer.php`, `Application.php`, `Company.php`:
```php
use Illuminate\Database\Eloquent\SoftDeletes;

class JobOffer extends Model
{
    use SoftDeletes;
    // ...
}
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/ app/Models/
git commit -m "feat: add soft deletes to JobOffer, Application, Company"
```

---

### Task 23: Feature tests

**Files:**
- Create: `tests/Feature/AuthTest.php`
- Create: `tests/Feature/JobOfferTest.php`
- Create: `tests/Feature/ApplicationTest.php`
- Create: `tests/Feature/NoteTest.php`
- Create: `tests/Feature/AdminTest.php`

- [ ] **Step 1: Create `tests/Feature/AuthTest.php`**

```php
<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_company(): void
    {
        $response = $this->postJson('/api/register', [
            'name'             => 'Test User',
            'email'            => 'test@example.com',
            'password'         => 'password123',
            'password_confirmation' => 'password123',
            'company_name'     => 'Test Co',
            'domain'           => null,
        ]);

        $response->assertStatus(201)->assertJsonStructure(['token', 'user']);
    }

    public function test_user_can_login(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        User::factory()->create(['email' => 'test@example.com', 'company_id' => $company->id, 'role' => 'recruiter']);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        User::factory()->create(['email' => 'test@example.com', 'company_id' => $company->id]);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_expired_invite_is_rejected(): void
    {
        $company = Company::create(['name' => 'Test Co']);
        Invitation::create([
            'company_id' => $company->id,
            'email'      => 'invite@example.com',
            'token'      => 'expiredtoken',
            'expires_at' => now()->subHour(),
        ]);

        $this->postJson('/api/register', [
            'invite_token'          => 'expiredtoken',
            'name'                  => 'New User',
            'email'                 => 'invite@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(400)->assertJson(['message' => 'This invite link has expired']);
    }
}
```

- [ ] **Step 2: Create `tests/Feature/JobOfferTest.php`**

```php
<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\JobOffer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobOfferTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): array
    {
        $company = Company::create(['name' => 'Acme']);
        $user = User::factory()->create(['company_id' => $company->id, 'role' => 'recruiter']);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $company, $token];
    }

    public function test_user_can_create_job_offer(): void
    {
        [, , $token] = $this->makeUser();

        $this->postJson('/api/job-offers', [
            'title'       => 'Engineer',
            'description' => 'Build things',
            'status'      => 'active',
        ], ['Authorization' => "Bearer $token"])
        ->assertStatus(201)
        ->assertJsonFragment(['title' => 'Engineer']);
    }

    public function test_user_cannot_see_other_company_jobs(): void
    {
        [$userA, $companyA, $tokenA] = $this->makeUser();
        $companyB = Company::create(['name' => 'Other Co']);
        $userB = User::factory()->create(['company_id' => $companyB->id]);
        JobOffer::create(['title' => 'B Job', 'description' => '...', 'company_id' => $companyB->id, 'created_by' => $userB->id]);

        $response = $this->getJson('/api/job-offers', ['Authorization' => "Bearer $tokenA"]);
        $response->assertStatus(200);
        $this->assertEmpty(collect($response->json())->where('title', 'B Job'));
    }

    public function test_validation_fails_without_title(): void
    {
        [, , $token] = $this->makeUser();

        $this->postJson('/api/job-offers', ['description' => 'No title'], ['Authorization' => "Bearer $token"])
            ->assertStatus(422);
    }
}
```

- [ ] **Step 3: Create `tests/Feature/ApplicationTest.php`**

```php
<?php
namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\JobOffer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_candidate_can_apply_to_active_job(): void
    {
        Storage::fake('public');
        $company = Company::create(['name' => 'Acme']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $job = JobOffer::create(['title' => 'Dev', 'description' => '...', 'status' => 'active', 'company_id' => $company->id, 'created_by' => $user->id]);

        $this->postJson("/api/public/jobs/{$job->id}/apply", [
            'first_name' => 'Jane',
            'last_name'  => 'Doe',
            'email'      => 'jane@example.com',
            'phone'      => '0612345678',
            'resume'     => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ])->assertStatus(201);

        $this->assertDatabaseHas('applications', ['job_offer_id' => $job->id]);
    }

    public function test_cannot_apply_to_inactive_job(): void
    {
        Storage::fake('public');
        $company = Company::create(['name' => 'Acme']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $job = JobOffer::create(['title' => 'Dev', 'description' => '...', 'status' => 'draft', 'company_id' => $company->id, 'created_by' => $user->id]);

        $this->postJson("/api/public/jobs/{$job->id}/apply", [
            'first_name' => 'Jane', 'last_name' => 'Doe',
            'email' => 'jane@example.com', 'phone' => '0612345678',
            'resume' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        ])->assertStatus(404);
    }

    public function test_recruiter_cannot_move_other_company_application(): void
    {
        $companyA = Company::create(['name' => 'A']);
        $companyB = Company::create(['name' => 'B']);
        $userA = User::factory()->create(['company_id' => $companyA->id]);
        $userB = User::factory()->create(['company_id' => $companyB->id]);
        $tokenA = $userA->createToken('t')->plainTextToken;
        $jobB = JobOffer::create(['title' => 'BJob', 'description' => '...', 'status' => 'active', 'company_id' => $companyB->id, 'created_by' => $userB->id]);
        $candidate = Candidate::create(['first_name' => 'X', 'last_name' => 'Y', 'email' => 'x@x.com', 'phone' => '0600000000']);
        $app = Application::create(['candidate_id' => $candidate->id, 'job_offer_id' => $jobB->id, 'status' => 'screening', 'kanban_order' => 0]);

        $this->putJson("/api/applications/{$app->id}/move", ['status' => 'hired', 'kanban_order' => 0], ['Authorization' => "Bearer $tokenA"])
            ->assertStatus(403);
    }
}
```

- [ ] **Step 4: Create `tests/Feature/NoteTest.php`**

```php
<?php
namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\JobOffer;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    private function setup_app(): array
    {
        $company = Company::create(['name' => 'Acme']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $token = $user->createToken('t')->plainTextToken;
        $job = JobOffer::create(['title' => 'Dev', 'description' => '...', 'status' => 'active', 'company_id' => $company->id, 'created_by' => $user->id]);
        $candidate = Candidate::create(['first_name' => 'J', 'last_name' => 'D', 'email' => 'j@d.com', 'phone' => '0600']);
        $app = Application::create(['candidate_id' => $candidate->id, 'job_offer_id' => $job->id, 'status' => 'screening', 'kanban_order' => 0]);
        return [$user, $token, $app];
    }

    public function test_recruiter_can_add_note(): void
    {
        [, $token, $app] = $this->setup_app();

        $this->postJson("/api/applications/{$app->id}/notes", ['content' => 'Great candidate'],
            ['Authorization' => "Bearer $token"]
        )->assertStatus(201)->assertJsonFragment(['content' => 'Great candidate']);
    }

    public function test_recruiter_can_only_delete_own_notes(): void
    {
        [$user, $token, $app] = $this->setup_app();

        $company = Company::find($user->company_id);
        $other = User::factory()->create(['company_id' => $company->id]);
        $note = Note::create(['user_id' => $other->id, 'application_id' => $app->id, 'content' => 'other note']);

        $this->deleteJson("/api/notes/{$note->id}", [], ['Authorization' => "Bearer $token"])
            ->assertStatus(403);
    }
}
```

- [ ] **Step 5: Create `tests/Feature/AdminTest.php`**

```php
<?php
namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'company_id' => null]);
        $token = $admin->createToken('t')->plainTextToken;

        $this->getJson('/api/admin/stats', ['Authorization' => "Bearer $token"])
            ->assertStatus(200)
            ->assertJsonStructure(['total_companies', 'total_users', 'total_jobs', 'total_applications']);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $company = Company::create(['name' => 'Acme']);
        $user = User::factory()->create(['company_id' => $company->id, 'role' => 'recruiter']);
        $token = $user->createToken('t')->plainTextToken;

        $this->getJson('/api/admin/stats', ['Authorization' => "Bearer $token"])
            ->assertStatus(403);
    }
}
```

- [ ] **Step 6: Run all tests**

```bash
php artisan test
```

Expected: all tests pass. Fix any failures before proceeding.

- [ ] **Step 7: Commit**

```bash
git add tests/Feature/
git commit -m "test: add feature tests for Auth, JobOffer, Application, Note, Admin — all scoping + access control"
```

---

## Final Phase — Commit and Verify

### Task 24: Final integration check

- [ ] **Step 1: Verify backend starts cleanly**

```bash
php artisan serve 2>&1 | head -5
```

Expected: `Starting Laravel development server: http://127.0.0.1:8000`

- [ ] **Step 2: Verify frontend builds without errors**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: build succeeds, no errors.

- [ ] **Step 3: Run full test suite**

```bash
php artisan test --stop-on-failure
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "refactor: Phase 1-6 complete — shared axios, components, auth context, tags, activities, analytics, bulk actions, policies, tests"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] 1.1 Shared Axios instance — Task 1 & 2
- [x] 1.2 RecruiterNavbar — Task 3
- [x] 1.3 PublicNavbar — Task 4
- [x] 1.4 AuthContext — Task 5
- [x] 1.5 Form Request classes — Task 6
- [x] 1.6 API Resource classes — Task 7
- [x] 1.7 ScopedByCompany — Task 8
- [x] 2.1 Kanban reorder bug — Task 9
- [x] 2.2 CORS lockdown — Task 10
- [x] 2.3 Rate limiting — Task 10
- [x] 2.4 Invite expiration — Task 11
- [x] 2.5 Toast + error handling — Task 12
- [x] 3 Tags system (backend + frontend) — Tasks 13 & 14
- [x] 4.1 Activity feed — Task 15 & 16
- [x] 4.2 Dashboard analytics upgrade — Task 16
- [x] 4.3 Kanban search (email match) — Task 17
- [x] 4.4 Bulk actions — Task 17
- [x] 4.5 Email notifications — Task 19
- [x] 4.6 JobDetails tabs — not yet implemented (add Task below)
- [x] 4.7 Public job board pagination — not yet implemented (add Task below)
- [x] 5.1 Skeleton loaders — Task 20
- [x] 5.2 Empty states — existing in pages, no changes needed for most
- [x] 5.3 ConfirmDialog — Task 18
- [x] 6.2 Database indexes — Task 21
- [x] 6.4 Soft deletes — Task 22
- [x] 6.5 Tests — Task 23

### Gap Tasks (add if time permits)

---

### Task 25: JobDetails tabs

**Files:**
- Modify: `frontend/src/pages/JobDetails.jsx`

- [ ] **Step 1: Add tab state and restructure JobDetails.jsx**

```jsx
const [activeTab, setActiveTab] = useState('overview');

const tabs = ['overview', 'pipeline', 'activity'];

// Tab bar:
<div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-6 w-fit">
    {tabs.map(tab => (
        <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {tab}
        </button>
    ))}
</div>

{/* Overview tab */}
{activeTab === 'overview' && (
    <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8">
        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 block">Description</label>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
    </div>
)}

{/* Pipeline tab */}
{activeTab === 'pipeline' && (
    <div className="mt-6">
        {/* Fetch applications count by status and display mini pipeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-4">Applications: {job.applications_count}</p>
            <button onClick={() => navigate(`/job-offers/${id}/pipeline`)}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold">
                Open Full Pipeline
            </button>
        </div>
    </div>
)}

{/* Activity tab */}
{activeTab === 'activity' && (
    <div className="mt-6 space-y-2">
        {activities.filter(a => a.subject_id === Number(id)).map(act => (
            <div key={act.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700">
                {act.description}
            </div>
        ))}
    </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/JobDetails.jsx
git commit -m "feat: JobDetails tabbed view — Overview, Pipeline summary, Activity"
```

---

### Task 26: Public job board pagination

**Files:**
- Modify: `app/Http/Controllers/PublicJobController.php`
- Modify: `frontend/src/pages/PublicJobs.jsx`

- [ ] **Step 1: Paginate in `PublicJobController@index`**

```php
public function index(Request $request)
{
    $jobs = JobOffer::where('status', 'active')
        ->with('company:id,name')
        ->orderBy('created_at', 'desc')
        ->paginate(12);

    return response()->json($jobs);
}
```

- [ ] **Step 2: Handle paginated response in `PublicJobs.jsx`**

```jsx
const [jobs, setJobs] = useState([]);
const [meta, setMeta] = useState(null);
const [page, setPage] = useState(1);

useEffect(() => {
    api.get(`/public/jobs?page=${page}`).then(r => {
        setJobs(r.data.data);
        setMeta(r.data.meta);
        setLoading(false);
    });
}, [page]);
```

Add pagination controls below the job list:
```jsx
{meta && meta.last_page > 1 && (
    <div className="flex items-center justify-center gap-3 mt-8">
        <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 disabled:opacity-40"
        >
            Previous
        </button>
        <span className="text-sm text-gray-500">Page {page} of {meta.last_page}</span>
        <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === meta.last_page}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 disabled:opacity-40"
        >
            Next
        </button>
    </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/PublicJobController.php frontend/src/pages/PublicJobs.jsx
git commit -m "feat: paginate public job board (12 per page) with navigation controls"
```
