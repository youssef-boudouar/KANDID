<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FakeDataSeeder extends Seeder
{
    public function run(): void
    {
        // ============================
        // COMPANIES (3 companies)
        // ============================
        DB::table('companies')->insert([
            ['id' => 1, 'name' => 'TechCorp', 'domain' => 'techcorp.com', 'subscription_status' => 'premium', 'settings' => null, 'created_at' => '2026-01-15 10:00:00', 'updated_at' => '2026-01-15 10:00:00'],
            ['id' => 2, 'name' => 'DesignStudio', 'domain' => 'designstudio.io', 'subscription_status' => 'free', 'settings' => null, 'created_at' => '2026-02-01 09:00:00', 'updated_at' => '2026-02-01 09:00:00'],
            ['id' => 3, 'name' => 'DataLab', 'domain' => 'datalab.ma', 'subscription_status' => 'premium', 'settings' => null, 'created_at' => '2026-03-10 14:00:00', 'updated_at' => '2026-03-10 14:00:00'],
        ]);

        // ============================
        // USERS (1 admin + 6 recruiters)
        // ============================
        DB::table('users')->insert([
            // Platform Admin (company_id required by schema, uses 1)
            ['id' => 1, 'name' => 'Youssef Boudouar', 'email' => 'admin@kandid.com', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-01-10 10:00:00', 'updated_at' => '2026-01-10 10:00:00', 'company_id' => 1, 'role' => 'admin'],
            // TechCorp recruiters
            ['id' => 2, 'name' => 'Sara El Amrani', 'email' => 'sara@techcorp.com', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-01-15 10:00:00', 'updated_at' => '2026-01-15 10:00:00', 'company_id' => 1, 'role' => 'recruiter'],
            ['id' => 3, 'name' => 'Karim Benali', 'email' => 'karim@techcorp.com', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-02-05 08:00:00', 'updated_at' => '2026-02-05 08:00:00', 'company_id' => 1, 'role' => 'recruiter'],
            // DesignStudio recruiters
            ['id' => 4, 'name' => 'Leila Tazi', 'email' => 'leila@designstudio.io', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-02-01 09:00:00', 'updated_at' => '2026-02-01 09:00:00', 'company_id' => 2, 'role' => 'recruiter'],
            ['id' => 5, 'name' => 'Omar Idrissi', 'email' => 'omar@designstudio.io', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-02-10 12:00:00', 'updated_at' => '2026-02-10 12:00:00', 'company_id' => 2, 'role' => 'recruiter'],
            // DataLab recruiters
            ['id' => 6, 'name' => 'Amine Fassi', 'email' => 'amine@datalab.ma', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-03-10 14:00:00', 'updated_at' => '2026-03-10 14:00:00', 'company_id' => 3, 'role' => 'recruiter'],
            ['id' => 7, 'name' => 'Fatima Chraibi', 'email' => 'fatima@datalab.ma', 'email_verified_at' => now(), 'password' => Hash::make('password'), 'remember_token' => null, 'created_at' => '2026-03-15 09:00:00', 'updated_at' => '2026-03-15 09:00:00', 'company_id' => 3, 'role' => 'recruiter'],
        ]);

        // ============================
        // JOB OFFERS (8 offers)
        // ============================
        DB::table('job_offers')->insert([
            ['id' => 1, 'company_id' => 1, 'created_by' => 2, 'title' => 'Fullstack Laravel/React Developer', 'description' => 'We need a fullstack dev with Laravel and React experience.', 'status' => 'active', 'created_at' => '2026-02-01 10:00:00', 'updated_at' => '2026-02-01 10:00:00'],
            ['id' => 2, 'company_id' => 1, 'created_by' => 3, 'title' => 'DevOps Engineer', 'description' => 'Looking for a DevOps engineer with Docker/K8s experience.', 'status' => 'active', 'created_at' => '2026-02-15 14:00:00', 'updated_at' => '2026-02-15 14:00:00'],
            ['id' => 3, 'company_id' => 1, 'created_by' => 2, 'title' => 'QA Tester', 'description' => 'Manual and automated testing.', 'status' => 'draft', 'created_at' => '2026-03-01 09:00:00', 'updated_at' => '2026-03-01 09:00:00'],
            ['id' => 4, 'company_id' => 2, 'created_by' => 4, 'title' => 'UI/UX Designer', 'description' => 'Figma expert needed for SaaS products.', 'status' => 'active', 'created_at' => '2026-02-20 11:00:00', 'updated_at' => '2026-02-20 11:00:00'],
            ['id' => 5, 'company_id' => 2, 'created_by' => 5, 'title' => 'Frontend React Developer', 'description' => 'React + Tailwind for our design platform.', 'status' => 'active', 'created_at' => '2026-03-05 10:00:00', 'updated_at' => '2026-03-05 10:00:00'],
            ['id' => 6, 'company_id' => 3, 'created_by' => 6, 'title' => 'Data Analyst', 'description' => 'SQL + Python for data analysis.', 'status' => 'active', 'created_at' => '2026-03-20 15:00:00', 'updated_at' => '2026-03-20 15:00:00'],
            ['id' => 7, 'company_id' => 3, 'created_by' => 6, 'title' => 'Machine Learning Engineer', 'description' => 'TensorFlow/PyTorch experience required.', 'status' => 'active', 'created_at' => '2026-04-01 08:00:00', 'updated_at' => '2026-04-01 08:00:00'],
            ['id' => 8, 'company_id' => 3, 'created_by' => 7, 'title' => 'Backend PHP Developer', 'description' => 'PHP/Laravel API development.', 'status' => 'draft', 'created_at' => '2026-04-10 10:00:00', 'updated_at' => '2026-04-10 10:00:00'],
        ]);

        // ============================
        // CANDIDATES (12 candidates)
        // ============================
        DB::table('candidates')->insert([
            ['id' => 1, 'first_name' => 'Ahmed', 'last_name' => 'Benali', 'email' => 'ahmed.benali@gmail.com', 'phone' => '0612345678', 'resume_path' => 'resumes/ahmed_benali.pdf', 'created_at' => '2026-02-05 10:00:00', 'updated_at' => '2026-02-05 10:00:00'],
            ['id' => 2, 'first_name' => 'Nadia', 'last_name' => 'Tazi', 'email' => 'nadia.tazi@gmail.com', 'phone' => '0623456789', 'resume_path' => 'resumes/nadia_tazi.pdf', 'created_at' => '2026-02-06 11:00:00', 'updated_at' => '2026-02-06 11:00:00'],
            ['id' => 3, 'first_name' => 'Rachid', 'last_name' => 'Mouhib', 'email' => 'rachid.m@outlook.com', 'phone' => '0634567890', 'resume_path' => 'resumes/rachid_mouhib.pdf', 'created_at' => '2026-02-10 09:00:00', 'updated_at' => '2026-02-10 09:00:00'],
            ['id' => 4, 'first_name' => 'Salma', 'last_name' => 'Idrissi', 'email' => 'salma.idrissi@yahoo.com', 'phone' => '0645678901', 'resume_path' => 'resumes/salma_idrissi.pdf', 'created_at' => '2026-02-15 14:00:00', 'updated_at' => '2026-02-15 14:00:00'],
            ['id' => 5, 'first_name' => 'Hassan', 'last_name' => 'Amrani', 'email' => 'hassan.amrani@gmail.com', 'phone' => '0656789012', 'resume_path' => 'resumes/hassan_amrani.pdf', 'created_at' => '2026-02-20 10:00:00', 'updated_at' => '2026-02-20 10:00:00'],
            ['id' => 6, 'first_name' => 'Meryem', 'last_name' => 'Fassi', 'email' => 'meryem.fassi@gmail.com', 'phone' => '0667890123', 'resume_path' => 'resumes/meryem_fassi.pdf', 'created_at' => '2026-03-01 08:00:00', 'updated_at' => '2026-03-01 08:00:00'],
            ['id' => 7, 'first_name' => 'Yassine', 'last_name' => 'Chraibi', 'email' => 'yassine.chraibi@hotmail.com', 'phone' => '0678901234', 'resume_path' => 'resumes/yassine_chraibi.pdf', 'created_at' => '2026-03-05 12:00:00', 'updated_at' => '2026-03-05 12:00:00'],
            ['id' => 8, 'first_name' => 'Imane', 'last_name' => 'Kabbaj', 'email' => 'imane.kabbaj@gmail.com', 'phone' => '0689012345', 'resume_path' => 'resumes/imane_kabbaj.pdf', 'created_at' => '2026-03-10 15:00:00', 'updated_at' => '2026-03-10 15:00:00'],
            ['id' => 9, 'first_name' => 'Mehdi', 'last_name' => 'Bennani', 'email' => 'mehdi.bennani@gmail.com', 'phone' => '0690123456', 'resume_path' => 'resumes/mehdi_bennani.pdf', 'created_at' => '2026-03-15 09:00:00', 'updated_at' => '2026-03-15 09:00:00'],
            ['id' => 10, 'first_name' => 'Zineb', 'last_name' => 'Alaoui', 'email' => 'zineb.alaoui@outlook.com', 'phone' => '0601234567', 'resume_path' => 'resumes/zineb_alaoui.pdf', 'created_at' => '2026-03-20 11:00:00', 'updated_at' => '2026-03-20 11:00:00'],
            ['id' => 11, 'first_name' => 'Adil', 'last_name' => 'Ouazzani', 'email' => 'adil.ouazzani@gmail.com', 'phone' => '0611223344', 'resume_path' => 'resumes/adil_ouazzani.pdf', 'created_at' => '2026-04-01 10:00:00', 'updated_at' => '2026-04-01 10:00:00'],
            ['id' => 12, 'first_name' => 'Kenza', 'last_name' => 'Berrada', 'email' => 'kenza.berrada@yahoo.com', 'phone' => '0622334455', 'resume_path' => 'resumes/kenza_berrada.pdf', 'created_at' => '2026-04-05 13:00:00', 'updated_at' => '2026-04-05 13:00:00'],
        ]);

        // ============================
        // APPLICATIONS (20 applications)
        // ============================
        DB::table('applications')->insert([
            // Job Offer 1 (Fullstack) — 6 applications (most popular)
            ['id' => 1,  'candidate_id' => 1,  'job_offer_id' => 1, 'status' => 'hired',     'kanban_order' => 1, 'created_at' => '2026-02-10 10:00:00', 'updated_at' => '2026-04-01 10:00:00'],
            ['id' => 2,  'candidate_id' => 2,  'job_offer_id' => 1, 'status' => 'interview',  'kanban_order' => 1, 'created_at' => '2026-02-12 11:00:00', 'updated_at' => '2026-03-15 11:00:00'],
            ['id' => 3,  'candidate_id' => 3,  'job_offer_id' => 1, 'status' => 'rejected',   'kanban_order' => 1, 'created_at' => '2026-02-14 09:00:00', 'updated_at' => '2026-03-01 09:00:00'],
            ['id' => 4,  'candidate_id' => 5,  'job_offer_id' => 1, 'status' => 'technical',  'kanban_order' => 2, 'created_at' => '2026-02-20 14:00:00', 'updated_at' => '2026-03-20 14:00:00'],
            ['id' => 5,  'candidate_id' => 7,  'job_offer_id' => 1, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-03-05 12:00:00', 'updated_at' => '2026-03-05 12:00:00'],
            ['id' => 6,  'candidate_id' => 9,  'job_offer_id' => 1, 'status' => 'screening',  'kanban_order' => 2, 'created_at' => '2026-03-15 09:00:00', 'updated_at' => '2026-03-15 09:00:00'],
            // Job Offer 2 (DevOps) — 3 applications
            ['id' => 7,  'candidate_id' => 3,  'job_offer_id' => 2, 'status' => 'interview',  'kanban_order' => 1, 'created_at' => '2026-02-20 10:00:00', 'updated_at' => '2026-03-10 10:00:00'],
            ['id' => 8,  'candidate_id' => 5,  'job_offer_id' => 2, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-02-25 11:00:00', 'updated_at' => '2026-02-25 11:00:00'],
            ['id' => 9,  'candidate_id' => 8,  'job_offer_id' => 2, 'status' => 'rejected',   'kanban_order' => 1, 'created_at' => '2026-03-10 15:00:00', 'updated_at' => '2026-03-20 15:00:00'],
            // Job Offer 3 (QA) — 0 applications (draft)
            // Job Offer 4 (UI/UX) — 4 applications
            ['id' => 10, 'candidate_id' => 4,  'job_offer_id' => 4, 'status' => 'hired',      'kanban_order' => 1, 'created_at' => '2026-02-25 14:00:00', 'updated_at' => '2026-04-05 14:00:00'],
            ['id' => 11, 'candidate_id' => 6,  'job_offer_id' => 4, 'status' => 'interview',  'kanban_order' => 1, 'created_at' => '2026-03-01 08:00:00', 'updated_at' => '2026-03-20 08:00:00'],
            ['id' => 12, 'candidate_id' => 8,  'job_offer_id' => 4, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-03-10 15:00:00', 'updated_at' => '2026-03-10 15:00:00'],
            ['id' => 13, 'candidate_id' => 10, 'job_offer_id' => 4, 'status' => 'rejected',   'kanban_order' => 1, 'created_at' => '2026-03-20 11:00:00', 'updated_at' => '2026-04-01 11:00:00'],
            // Job Offer 5 (Frontend React) — 2 applications
            ['id' => 14, 'candidate_id' => 2,  'job_offer_id' => 5, 'status' => 'technical',  'kanban_order' => 1, 'created_at' => '2026-03-10 11:00:00', 'updated_at' => '2026-04-01 11:00:00'],
            ['id' => 15, 'candidate_id' => 7,  'job_offer_id' => 5, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-03-15 12:00:00', 'updated_at' => '2026-03-15 12:00:00'],
            // Job Offer 6 (Data Analyst) — 3 applications
            ['id' => 16, 'candidate_id' => 9,  'job_offer_id' => 6, 'status' => 'hired',      'kanban_order' => 1, 'created_at' => '2026-03-25 09:00:00', 'updated_at' => '2026-04-20 09:00:00'],
            ['id' => 17, 'candidate_id' => 10, 'job_offer_id' => 6, 'status' => 'interview',  'kanban_order' => 1, 'created_at' => '2026-03-28 11:00:00', 'updated_at' => '2026-04-10 11:00:00'],
            ['id' => 18, 'candidate_id' => 11, 'job_offer_id' => 6, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-04-01 10:00:00', 'updated_at' => '2026-04-01 10:00:00'],
            // Job Offer 7 (ML Engineer) — 2 applications
            ['id' => 19, 'candidate_id' => 1,  'job_offer_id' => 7, 'status' => 'interview',  'kanban_order' => 1, 'created_at' => '2026-04-05 08:00:00', 'updated_at' => '2026-04-15 08:00:00'],
            ['id' => 20, 'candidate_id' => 11, 'job_offer_id' => 7, 'status' => 'screening',  'kanban_order' => 1, 'created_at' => '2026-04-10 10:00:00', 'updated_at' => '2026-04-10 10:00:00'],
            // Job Offer 8 (Backend PHP) — 0 applications (draft)
        ]);

        // ============================
        // NOTES (15 notes)
        // ============================
        DB::table('notes')->insert([
            ['id' => 1,  'user_id' => 2, 'application_id' => 1, 'content' => 'Excellent profil, solide en Laravel et React. A embaucher.', 'created_at' => '2026-02-15 10:00:00', 'updated_at' => '2026-02-15 10:00:00'],
            ['id' => 2,  'user_id' => 3, 'application_id' => 1, 'content' => 'Entretien technique reussi. Bonne communication.', 'created_at' => '2026-03-01 14:00:00', 'updated_at' => '2026-03-01 14:00:00'],
            ['id' => 3,  'user_id' => 2, 'application_id' => 1, 'content' => 'References verifiees, tout est OK.', 'created_at' => '2026-03-20 09:00:00', 'updated_at' => '2026-03-20 09:00:00'],
            ['id' => 4,  'user_id' => 2, 'application_id' => 2, 'content' => 'Bon profil frontend, un peu faible en backend.', 'created_at' => '2026-02-18 11:00:00', 'updated_at' => '2026-02-18 11:00:00'],
            ['id' => 5,  'user_id' => 3, 'application_id' => 2, 'content' => 'A prevoir un test technique supplementaire.', 'created_at' => '2026-03-05 10:00:00', 'updated_at' => '2026-03-05 10:00:00'],
            ['id' => 6,  'user_id' => 2, 'application_id' => 3, 'content' => 'Pas assez d experience. Rejete.', 'created_at' => '2026-02-25 09:00:00', 'updated_at' => '2026-02-25 09:00:00'],
            ['id' => 7,  'user_id' => 3, 'application_id' => 7, 'content' => 'Connait Docker mais pas Kubernetes.', 'created_at' => '2026-03-01 10:00:00', 'updated_at' => '2026-03-01 10:00:00'],
            ['id' => 8,  'user_id' => 4, 'application_id' => 10, 'content' => 'Portfolio impressionnant, maitrise Figma.', 'created_at' => '2026-03-05 14:00:00', 'updated_at' => '2026-03-05 14:00:00'],
            ['id' => 9,  'user_id' => 5, 'application_id' => 10, 'content' => 'Design system propre, bonne methodologie.', 'created_at' => '2026-03-15 11:00:00', 'updated_at' => '2026-03-15 11:00:00'],
            ['id' => 10, 'user_id' => 4, 'application_id' => 10, 'content' => 'Offre acceptee, commence le mois prochain.', 'created_at' => '2026-04-01 09:00:00', 'updated_at' => '2026-04-01 09:00:00'],
            ['id' => 11, 'user_id' => 6, 'application_id' => 16, 'content' => 'Tres bon en SQL et Python. Test reussi.', 'created_at' => '2026-04-01 09:00:00', 'updated_at' => '2026-04-01 09:00:00'],
            ['id' => 12, 'user_id' => 7, 'application_id' => 16, 'content' => 'Bonne attitude, travail en equipe.', 'created_at' => '2026-04-10 11:00:00', 'updated_at' => '2026-04-10 11:00:00'],
            ['id' => 13, 'user_id' => 6, 'application_id' => 19, 'content' => 'Profil interessant mais manque experience ML.', 'created_at' => '2026-04-10 08:00:00', 'updated_at' => '2026-04-10 08:00:00'],
            ['id' => 14, 'user_id' => 2, 'application_id' => 4, 'content' => 'Hassan est fort en React, a tester en technique.', 'created_at' => '2026-03-01 14:00:00', 'updated_at' => '2026-03-01 14:00:00'],
            ['id' => 15, 'user_id' => 2, 'application_id' => 5, 'content' => 'Candidature recue, a screener.', 'created_at' => '2026-03-10 12:00:00', 'updated_at' => '2026-03-10 12:00:00'],
        ]);

        // ============================
        // TAGS (8 tags)
        // ============================
        DB::table('tags')->insert([
            ['id' => 1, 'company_id' => 1, 'name' => 'Laravel', 'color' => '#EF4444', 'created_at' => '2026-02-01 10:00:00', 'updated_at' => '2026-02-01 10:00:00'],
            ['id' => 2, 'company_id' => 1, 'name' => 'React', 'color' => '#3B82F6', 'created_at' => '2026-02-01 10:00:00', 'updated_at' => '2026-02-01 10:00:00'],
            ['id' => 3, 'company_id' => 1, 'name' => 'DevOps', 'color' => '#10B981', 'created_at' => '2026-02-01 10:00:00', 'updated_at' => '2026-02-01 10:00:00'],
            ['id' => 4, 'company_id' => 2, 'name' => 'Figma', 'color' => '#A855F7', 'created_at' => '2026-02-01 09:00:00', 'updated_at' => '2026-02-01 09:00:00'],
            ['id' => 5, 'company_id' => 2, 'name' => 'UI/UX', 'color' => '#F59E0B', 'created_at' => '2026-02-01 09:00:00', 'updated_at' => '2026-02-01 09:00:00'],
            ['id' => 6, 'company_id' => 3, 'name' => 'Python', 'color' => '#3B82F6', 'created_at' => '2026-03-10 14:00:00', 'updated_at' => '2026-03-10 14:00:00'],
            ['id' => 7, 'company_id' => 3, 'name' => 'SQL', 'color' => '#F97316', 'created_at' => '2026-03-10 14:00:00', 'updated_at' => '2026-03-10 14:00:00'],
            ['id' => 8, 'company_id' => 3, 'name' => 'Machine Learning', 'color' => '#06B6D4', 'created_at' => '2026-03-10 14:00:00', 'updated_at' => '2026-03-10 14:00:00'],
        ]);

        // ============================
        // JOB_OFFER_TAG (pivot)
        // ============================
        DB::table('job_offer_tag')->insert([
            ['job_offer_id' => 1, 'tag_id' => 1],
            ['job_offer_id' => 1, 'tag_id' => 2],
            ['job_offer_id' => 2, 'tag_id' => 3],
            ['job_offer_id' => 4, 'tag_id' => 4],
            ['job_offer_id' => 4, 'tag_id' => 5],
            ['job_offer_id' => 5, 'tag_id' => 5],
            ['job_offer_id' => 6, 'tag_id' => 6],
            ['job_offer_id' => 6, 'tag_id' => 7],
            ['job_offer_id' => 7, 'tag_id' => 6],
            ['job_offer_id' => 7, 'tag_id' => 8],
        ]);

        // ============================
        // INVITATIONS (3 pending)
        // ============================
        DB::table('invitations')->insert([
            ['id' => 1, 'company_id' => 1, 'email' => 'newrecruiter@techcorp.com', 'token' => Str::random(32), 'created_at' => '2026-04-20 10:00:00', 'updated_at' => '2026-04-20 10:00:00'],
            ['id' => 2, 'company_id' => 2, 'email' => 'designer@designstudio.io', 'token' => Str::random(32), 'created_at' => '2026-04-22 09:00:00', 'updated_at' => '2026-04-22 09:00:00'],
            ['id' => 3, 'company_id' => 3, 'email' => 'junior@datalab.ma', 'token' => Str::random(32), 'created_at' => '2026-04-25 14:00:00', 'updated_at' => '2026-04-25 14:00:00'],
        ]);
    }
}
