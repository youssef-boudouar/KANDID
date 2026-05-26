<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('activities')->truncate();
        DB::table('notes')->truncate();
        DB::table('applications')->truncate();
        DB::table('job_offer_tag')->truncate();
        DB::table('tags')->truncate();
        DB::table('candidates')->truncate();
        DB::table('job_offers')->truncate();
        DB::table('invitations')->truncate();
        DB::table('users')->truncate();
        DB::table('companies')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ── Company ─────────────────────────────────────────────────
        // Insert with created_by = null; update after users are created
        DB::table('companies')->insert([
            'id'                  => 1,
            'created_by'          => null,
            'name'                => 'TechCorp',
            'domain'              => 'techcorp.io',
            'subscription_status' => 'premium',
            'settings'            => null,
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        // ── Users ────────────────────────────────────────────────────
        $users = [
            ['id' => 1, 'name' => 'Youssef Boudouar', 'email' => 'admin@kandid.com',  'role' => 'admin',     'sex' => 'male'],
            ['id' => 2, 'name' => 'Sara El Amrani',   'email' => 'sara@kandid.com',    'role' => 'recruiter', 'sex' => 'female'],
            ['id' => 3, 'name' => 'Karim Benali',     'email' => 'karim@kandid.com',   'role' => 'recruiter', 'sex' => 'male'],
            ['id' => 4, 'name' => 'Nadia Idrissi',    'email' => 'nadia@kandid.com',   'role' => 'recruiter', 'sex' => 'female'],
        ];
        foreach ($users as $u) {
            DB::table('users')->insert([
                'id'                => $u['id'],
                'name'              => $u['name'],
                'email'             => $u['email'],
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'remember_token'    => null,
                'company_id'        => 1,
                'role'              => $u['role'],
                'sex'               => $u['sex'],
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // Backfill company creator
        DB::table('companies')->where('id', 1)->update(['created_by' => 3]);

        // ── Job Offers ───────────────────────────────────────────────
        $jobs = [
            ['id' => 1, 'title' => 'Senior Full-Stack Engineer',     'status' => 'active',   'created_by' => 1],
            ['id' => 2, 'title' => 'Product Designer (UX/UI)',        'status' => 'active',   'created_by' => 2],
            ['id' => 3, 'title' => 'DevOps Engineer',                 'status' => 'active',   'created_by' => 3],
            ['id' => 4, 'title' => 'Data Scientist',                  'status' => 'active',   'created_by' => 1],
            ['id' => 5, 'title' => 'Frontend Engineer (React)',       'status' => 'active',   'created_by' => 2],
            ['id' => 6, 'title' => 'Backend Engineer (Laravel/PHP)',  'status' => 'active',   'created_by' => 4],
            ['id' => 7, 'title' => 'Mobile Developer (React Native)', 'status' => 'draft',    'created_by' => 3],
            ['id' => 8, 'title' => 'Marketing & Growth Manager',      'status' => 'archived', 'created_by' => 2],
        ];
        $descriptions = [
            'We are looking for a talented engineer to join our growing team. You will work closely with product and design to ship impactful features at scale.',
            'Join our design team to craft beautiful, user-centric experiences. You will own end-to-end design from research to high-fidelity prototypes.',
            'Help us build and maintain scalable infrastructure. You will own CI/CD pipelines, cloud deployments, and reliability engineering.',
            'Leverage data to drive product decisions. You will build ML models, dashboards, and data pipelines that power our core product.',
            'Build fast, accessible React interfaces. You will work with our design system and collaborate closely with backend and product teams.',
            'Build the APIs and services that power our product. You will own database design, performance, and API architecture.',
            'Bring our product to mobile. You will ship a polished React Native app for iOS and Android from scratch.',
            'Drive user acquisition and retention. You will own growth experiments, performance marketing, and brand strategy.',
        ];
        foreach ($jobs as $i => $j) {
            DB::table('job_offers')->insert([
                'id'          => $j['id'],
                'company_id'  => 1,
                'created_by'  => $j['created_by'],
                'title'       => $j['title'],
                'description' => $descriptions[$i],
                'status'      => $j['status'],
                'created_at'  => now()->subDays(rand(30, 90)),
                'updated_at'  => now(),
            ]);
        }

        // ── Tags ─────────────────────────────────────────────────────
        $tags = [
            ['id' => 1, 'name' => 'JavaScript',   'color' => '#f7df1e'],
            ['id' => 2, 'name' => 'React',         'color' => '#61dafb'],
            ['id' => 3, 'name' => 'PHP',           'color' => '#8892bf'],
            ['id' => 4, 'name' => 'Laravel',       'color' => '#ff2d20'],
            ['id' => 5, 'name' => 'Python',        'color' => '#3572a5'],
            ['id' => 6, 'name' => 'DevOps',        'color' => '#e95420'],
            ['id' => 7, 'name' => 'UI/UX',         'color' => '#a855f7'],
            ['id' => 8, 'name' => 'Data Science',  'color' => '#06b6d4'],
        ];
        foreach ($tags as $t) {
            DB::table('tags')->insert([
                'id'         => $t['id'],
                'company_id' => 1,
                'name'       => $t['name'],
                'color'      => $t['color'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $pivots = [
            [1, 1], [1, 2], [1, 3],
            [2, 7], [2, 2],
            [3, 6], [3, 5],
            [4, 5], [4, 8],
            [5, 1], [5, 2],
            [6, 3], [6, 4],
            [7, 1], [7, 2],
            [8, 7],
        ];
        foreach ($pivots as [$jid, $tid]) {
            DB::table('job_offer_tag')->insert(['job_offer_id' => $jid, 'tag_id' => $tid]);
        }

        // ── Candidates ───────────────────────────────────────────────
        $candidates = [
            ['id' =>  1, 'first' => 'Amine',       'last' => 'Tazi',         'email' => 'amine.tazi@gmail.com',         'sex' => 'male'],
            ['id' =>  2, 'first' => 'Hajar',        'last' => 'Bennis',       'email' => 'hajar.bennis@gmail.com',       'sex' => 'female'],
            ['id' =>  3, 'first' => 'Yassine',      'last' => 'Ouali',        'email' => 'yassine.ouali@outlook.com',    'sex' => 'male'],
            ['id' =>  4, 'first' => 'Salma',        'last' => 'Ezzahraoui',   'email' => 'salma.ezzahraoui@gmail.com',   'sex' => 'female'],
            ['id' =>  5, 'first' => 'Omar',         'last' => 'Kachmar',      'email' => 'omar.kachmar@hotmail.com',     'sex' => 'male'],
            ['id' =>  6, 'first' => 'Fatima Zahra', 'last' => 'Mrani',        'email' => 'fz.mrani@gmail.com',           'sex' => 'female'],
            ['id' =>  7, 'first' => 'Mehdi',        'last' => 'Alaoui',       'email' => 'mehdi.alaoui@gmail.com',       'sex' => 'male'],
            ['id' =>  8, 'first' => 'Nour Eddine',  'last' => 'Bakkali',      'email' => 'n.bakkali@outlook.com',        'sex' => 'male'],
            ['id' =>  9, 'first' => 'Rim',          'last' => 'Qotbi',        'email' => 'rim.qotbi@gmail.com',          'sex' => 'female'],
            ['id' => 10, 'first' => 'Khalid',       'last' => 'Sefrioui',     'email' => 'k.sefrioui@gmail.com',         'sex' => 'male'],
            ['id' => 11, 'first' => 'Zineb',        'last' => 'Moussaoui',    'email' => 'zineb.moussaoui@gmail.com',    'sex' => 'female'],
            ['id' => 12, 'first' => 'Adil',         'last' => 'Chraibi',      'email' => 'adil.chraibi@outlook.com',     'sex' => 'male'],
            ['id' => 13, 'first' => 'Loubna',       'last' => 'Hafiani',      'email' => 'loubna.hafiani@gmail.com',     'sex' => 'female'],
            ['id' => 14, 'first' => 'Hamza',        'last' => 'Benkirane',    'email' => 'hamza.benkirane@gmail.com',    'sex' => 'male'],
            ['id' => 15, 'first' => 'Imane',        'last' => 'Berrada',      'email' => 'imane.berrada@hotmail.com',    'sex' => 'female'],
            ['id' => 16, 'first' => 'Rachid',       'last' => 'Lahlou',       'email' => 'r.lahlou@gmail.com',           'sex' => 'male'],
            ['id' => 17, 'first' => 'Yasmine',      'last' => 'Squalli',      'email' => 'yasmine.squalli@gmail.com',    'sex' => 'female'],
            ['id' => 18, 'first' => 'Issam',        'last' => 'Filali',       'email' => 'issam.filali@outlook.com',     'sex' => 'male'],
            ['id' => 19, 'first' => 'Houda',        'last' => 'Cherkaoui',    'email' => 'houda.cherkaoui@gmail.com',    'sex' => 'female'],
            ['id' => 20, 'first' => 'Reda',          'last' => 'El Mansouri',  'email' => 'reda.elmansouri@gmail.com',    'sex' => 'male'],
            ['id' => 21, 'first' => 'Soukaina',     'last' => 'Rhazi',        'email' => 'soukaina.rhazi@gmail.com',     'sex' => 'female'],
            ['id' => 22, 'first' => 'Tarik',        'last' => 'El Fassi',     'email' => 't.elfassi@hotmail.com',        'sex' => 'male'],
            ['id' => 23, 'first' => 'Meriem',       'last' => 'Benjelloun',   'email' => 'meriem.benjelloun@gmail.com',  'sex' => 'female'],
            ['id' => 24, 'first' => 'Othmane',      'last' => 'Bensouda',     'email' => 'o.bensouda@outlook.com',       'sex' => 'male'],
            ['id' => 25, 'first' => 'Chaima',       'last' => 'Naciri',       'email' => 'chaima.naciri@gmail.com',      'sex' => 'female'],
            ['id' => 26, 'first' => 'Bilal',        'last' => 'Tlemcani',     'email' => 'bilal.tlemcani@gmail.com',     'sex' => 'male'],
            ['id' => 27, 'first' => 'Samira',       'last' => 'Kettani',      'email' => 'samira.kettani@gmail.com',     'sex' => 'female'],
            ['id' => 28, 'first' => 'Anas',         'last' => 'Bouabdallah',  'email' => 'anas.bouabdallah@outlook.com', 'sex' => 'male'],
            ['id' => 29, 'first' => 'Kenza',        'last' => 'Alami',        'email' => 'kenza.alami@gmail.com',        'sex' => 'female'],
            ['id' => 30, 'first' => 'Rida',         'last' => 'El Ouazzani',  'email' => 'rida.elouazzani@gmail.com',    'sex' => 'male'],
        ];
        foreach ($candidates as $c) {
            DB::table('candidates')->insert([
                'id'          => $c['id'],
                'first_name'  => $c['first'],
                'last_name'   => $c['last'],
                'email'       => $c['email'],
                'phone'       => '+212 661 234 ' . str_pad($c['id'], 3, '0', STR_PAD_LEFT),
                'resume_path' => null,
                'sex'         => $c['sex'],
                'created_at'  => now()->subDays(rand(20, 80)),
                'updated_at'  => now(),
            ]);
        }

        // ── Applications ─────────────────────────────────────────────
        // 86 total: screening=22, interview=18, technical=14, hired=16, rejected=16
        // Date distribution creates upward trend:
        //   this week (Jun 2-6):  18 apps  ← ~+125% vs last week
        //   last week (May 26-Jun 1): 8 apps
        //   May 12-25: 20 apps
        //   May 1-11:  16 apps
        //   April:     16 apps
        //   March:     8 apps

        $now = Carbon::create(2026, 6, 6, 23, 59, 59);

        // [candidate_id, job_offer_id, status, days_ago]
        // Every (candidate_id, job_offer_id) pair is unique — no candidate appears
        // twice in the same job's kanban board.
        // Job assignments:
        //   Job1(16): c1,4,9,14,20,26,2,8,16,22,28,3,10,17,24,30
        //   Job2(14): c2,8,15,21,27,5,11,17,23,29,6,12,18,24
        //   Job3(13): c7,12,19,24,6,18,9,13,3,15,21,27,30
        //   Job4(12): c5,10,22,1,7,4,28,13,19,25,16,11
        //   Job5(13): c8,17,23,3,11,14,20,26,2,6,12,18,29
        //   Job6(11): c13,18,25,7,19,1,6,12,24,30,3
        //   Job7(5):  c27,28,29,30,25
        //   Job8(2):  c23,15
        $apps = [
            // ── This week (Jun 2–6) — 18 apps ──────────────────────
            [ 1, 1, 'screening',  0],
            [ 2, 2, 'screening',  0],
            [ 5, 4, 'screening',  0],
            [ 4, 1, 'screening',  1],
            [ 6, 2, 'screening',  1],
            [ 7, 3, 'screening',  1],
            [ 8, 5, 'screening',  1],
            [ 9, 1, 'interview',  2],
            [10, 4, 'interview',  2],
            [11, 2, 'interview',  2],
            [12, 3, 'screening',  3],
            [13, 6, 'screening',  3],
            [14, 1, 'technical',  3],
            [15, 2, 'interview',  3],
            [16, 1, 'screening',  4],
            [17, 5, 'interview',  4],
            [18, 6, 'screening',  4],
            [19, 3, 'hired',      4],
            // ── Last week (May 26–Jun 1) — 8 apps ──────────────────
            [20, 1, 'screening',  5],
            [21, 2, 'technical',  6],
            [22, 4, 'hired',      7],
            [23, 5, 'screening',  7],
            [24, 3, 'interview',  8],
            [25, 6, 'screening',  9],
            [26, 1, 'rejected',  10],
            [27, 2, 'hired',     11],
            // ── May 12–25 — 20 apps ─────────────────────────────────
            [28, 1, 'technical', 12],
            [ 3, 5, 'interview', 12],
            [ 2, 1, 'interview', 13],
            [17, 2, 'interview', 13],
            [ 3, 1, 'screening', 14],
            [ 6, 3, 'interview', 14],
            [29, 2, 'technical', 15],
            [ 1, 4, 'technical', 15],
            [ 8, 1, 'screening', 16],
            [11, 5, 'interview', 16],
            [14, 5, 'hired',     17],
            [ 7, 4, 'hired',     17],
            [18, 3, 'technical', 18],
            [12, 2, 'hired',     18],
            [ 9, 3, 'hired',     19],
            [30, 1, 'rejected',  19],
            [ 4, 4, 'rejected',  20],
            [13, 3, 'hired',     20],
            [20, 5, 'rejected',  21],
            [16, 4, 'screening', 21],
            // ── May 1–11 — 16 apps ──────────────────────────────────
            [22, 1, 'hired',     26],
            [10, 1, 'interview', 27],
            [ 8, 2, 'technical', 27],
            [ 5, 2, 'rejected',  28],
            [ 3, 3, 'technical', 28],
            [15, 3, 'rejected',  29],
            [28, 4, 'hired',     29],
            [13, 4, 'rejected',  30],
            [29, 5, 'technical', 30],
            [26, 5, 'rejected',  31],
            [ 7, 6, 'hired',     31],
            [19, 6, 'rejected',  32],
            [ 1, 6, 'screening', 33],
            [ 6, 5, 'interview', 33],
            [27, 7, 'screening', 34],
            [28, 7, 'hired',     35],
            // ── April — 16 apps ─────────────────────────────────────
            [17, 1, 'hired',     40],
            [24, 1, 'rejected',  43],
            [23, 2, 'interview', 46],
            [18, 2, 'rejected',  49],
            [21, 3, 'technical', 50],
            [27, 3, 'hired',     52],
            [19, 4, 'interview', 54],
            [25, 4, 'rejected',  55],
            [ 2, 5, 'technical', 57],
            [12, 5, 'rejected',  58],
            [ 6, 6, 'hired',     59],
            [12, 6, 'interview', 60],
            [24, 6, 'rejected',  61],
            [30, 6, 'technical', 62],
            [29, 7, 'rejected',  63],
            [25, 7, 'screening', 64],
            // ── March — 8 apps ──────────────────────────────────────
            [24, 2, 'screening', 68],
            [30, 3, 'interview', 71],
            [11, 4, 'technical', 73],
            [18, 5, 'interview', 76],
            [ 3, 6, 'technical', 78],
            [30, 7, 'screening', 81],
            [23, 8, 'hired',     84],
            [15, 8, 'rejected',  88],
        ];

        $appIds = [];
        foreach ($apps as $idx => $a) {
            [$cid, $jid, $status, $daysAgo] = $a;
            $createdAt = $now->copy()->subDays($daysAgo)->setTime(rand(8, 19), rand(0, 59), rand(0, 59));
            $id = $idx + 1;
            DB::table('applications')->insert([
                'id'           => $id,
                'candidate_id' => $cid,
                'job_offer_id' => $jid,
                'status'       => $status,
                'kanban_order' => $idx,
                'created_at'   => $createdAt,
                'updated_at'   => $createdAt,
            ]);
            $appIds[] = ['id' => $id, 'status' => $status, 'created_at' => $createdAt];
        }

        // ── Notes ────────────────────────────────────────────────────
        // Hired applications get 3–5 notes from different recruiters (full thread).
        // Other statuses get 1 note.
        $hiredNoteThreads = [
            [
                [1, 'Received application — strong portfolio and relevant background. Recommending for interview.'],
                [2, 'First interview done. Excellent communicator, clear problem-solving skills. Moving to technical stage.'],
                [3, 'Technical challenge score: 91/100. Code was clean, well-structured, and documented. Very impressed.'],
                [4, 'Reference check complete — all positive feedback from previous managers. Cleared for offer.'],
                [1, 'Offer sent and accepted! Starting date confirmed. Great hire for the team.'],
            ],
            [
                [2, 'Profile reviewed — impressive experience for the level. Shortlisted for screening call.'],
                [3, 'Screening call went very well. Strong cultural fit, asks the right questions. Proceed to interview.'],
                [1, 'Panel interview completed. All three interviewers gave positive feedback. Standout candidate.'],
                [4, 'Technical assessment passed with flying colors. System design answers were particularly strong.'],
                [2, 'Offer negotiation done — candidate accepted. Onboarding scheduled for next month.'],
            ],
            [
                [3, 'Initial review: candidate has exactly the stack we need. Fast-tracking to interview.'],
                [4, 'First call was great — very motivated, knows their stuff. Scheduling technical round.'],
                [2, 'Technical round passed. Live coding was clean and they explained their thinking throughout.'],
                [1, 'References checked — two former managers praised their ownership and delivery speed.'],
                [3, 'Offer accepted after brief negotiation. Exceptional addition to the team.'],
            ],
            [
                [4, 'Promising resume — 4 years experience, solid open-source contributions. Moving forward.'],
                [1, 'Interview completed. Candidate showed deep technical knowledge and great attitude.'],
                [2, 'Technical challenge returned with high score. Added thoughtful inline comments explaining decisions.'],
                [4, 'Background check cleared. All references enthusiastic. Ready to extend offer.'],
                [3, 'Offer accepted. Starting in two weeks. Looking forward to having them on board.'],
            ],
            [
                [2, 'Strong application — immediately stood out in the stack ranking. Scheduling intro call.'],
                [1, 'Intro call confirmed our impression. Excellent communication, very clear on their experience.'],
                [3, 'Technical round: completed ahead of time, correct output, good code structure.'],
                [4, 'Reference call with previous CTO — described candidate as one of the best they\'d worked with.'],
                [2, 'Offer extended and accepted same day. Great close — zero negotiation needed.'],
            ],
        ];
        $noteId   = 1;
        $threadIdx = 0;

        $notesByStatus = [
            'screening' => [
                'Resume looks strong, relevant experience across the board.',
                'Great communication in the initial screening call.',
                'Promising profile — recommending for next stage.',
            ],
            'interview' => [
                'First interview went well. Technical knowledge is solid.',
                'Good cultural fit, scheduling a follow-up.',
                'Impressive problem-solving approach under pressure.',
            ],
            'technical' => [
                'Technical challenge score: 87/100. Code quality excellent.',
                'Strong system design answers, well-structured solutions.',
                'Clean, well-documented code — exceeded expectations.',
            ],
            'rejected'  => [
                'Skills gap in a required area at this time.',
                'Strong candidate but not the right fit for this role.',
                'Position filled with a stronger match.',
            ],
        ];

        foreach ($appIds as $app) {
            if ($app['status'] === 'hired') {
                $thread = $hiredNoteThreads[$threadIdx % count($hiredNoteThreads)];
                $threadIdx++;
                $offset = 1;
                foreach ($thread as [$uid, $content]) {
                    $ts = $app['created_at']->copy()->addHours($offset);
                    DB::table('notes')->insert([
                        'id'             => $noteId++,
                        'user_id'        => $uid,
                        'application_id' => $app['id'],
                        'content'        => $content,
                        'created_at'     => $ts,
                        'updated_at'     => $ts,
                    ]);
                    $offset += rand(6, 24);
                }
            } else {
                $opts    = $notesByStatus[$app['status']] ?? ['Candidate reviewed.'];
                $content = $opts[array_rand($opts)];
                $uid     = [1, 2, 3, 4][array_rand([1, 2, 3, 4])];
                $ts      = $app['created_at']->copy()->addHours(rand(1, 6));
                DB::table('notes')->insert([
                    'id'             => $noteId++,
                    'user_id'        => $uid,
                    'application_id' => $app['id'],
                    'content'        => $content,
                    'created_at'     => $ts,
                    'updated_at'     => $ts,
                ]);
            }
        }

        // ── Activities ───────────────────────────────────────────────
        $activities = [
            ['user_id' => 1, 'desc' => 'Youssef Boudouar moved Amine Tazi to Interview',                        'days' => 0,  'hours' => 2],
            ['user_id' => 2, 'desc' => 'Sara El Amrani added a note on Hajar Bennis',                           'days' => 0,  'hours' => 3],
            ['user_id' => 3, 'desc' => 'Karim Benali posted Senior Full-Stack Engineer',                        'days' => 0,  'hours' => 5],
            ['user_id' => 4, 'desc' => 'Nadia Idrissi moved Omar Kachmar to Technical',                         'days' => 1,  'hours' => 1],
            ['user_id' => 1, 'desc' => 'Youssef Boudouar hired Mehdi Alaoui for DevOps Engineer',               'days' => 1,  'hours' => 4],
            ['user_id' => 2, 'desc' => 'Sara El Amrani reviewed application from Salma Ezzahraoui',             'days' => 1,  'hours' => 6],
            ['user_id' => 3, 'desc' => 'Karim Benali added a note on Nour Eddine Bakkali',                      'days' => 2,  'hours' => 2],
            ['user_id' => 4, 'desc' => 'Nadia Idrissi moved Rim Qotbi to Interview',                            'days' => 2,  'hours' => 5],
            ['user_id' => 1, 'desc' => 'Youssef Boudouar hired Zineb Moussaoui for Frontend Engineer (React)',  'days' => 3,  'hours' => 3],
            ['user_id' => 2, 'desc' => 'Sara El Amrani archived Marketing & Growth Manager',                    'days' => 3,  'hours' => 7],
            ['user_id' => 3, 'desc' => 'Karim Benali moved Adil Chraibi to Technical',                          'days' => 4,  'hours' => 1],
            ['user_id' => 1, 'desc' => 'Youssef Boudouar moved Loubna Hafiani to Screening',                    'days' => 6,  'hours' => 2],
            ['user_id' => 4, 'desc' => 'Nadia Idrissi hired Hamza Benkirane for Data Scientist',                'days' => 7,  'hours' => 3],
            ['user_id' => 2, 'desc' => 'Sara El Amrani posted Product Designer (UX/UI)',                        'days' => 8,  'hours' => 4],
            ['user_id' => 3, 'desc' => 'Karim Benali moved Imane Berrada to Interview',                         'days' => 14, 'hours' => 2],
            ['user_id' => 1, 'desc' => 'Youssef Boudouar hired Rachid Lahlou for Backend Engineer (Laravel)',   'days' => 15, 'hours' => 1],
            ['user_id' => 2, 'desc' => 'Sara El Amrani reviewed application from Yasmine Squalli',              'days' => 18, 'hours' => 5],
            ['user_id' => 4, 'desc' => 'Nadia Idrissi moved Issam Filali to Technical',                         'days' => 20, 'hours' => 3],
            ['user_id' => 1, 'desc' => 'Youssef Boudouar posted DevOps Engineer',                               'days' => 25, 'hours' => 9],
            ['user_id' => 3, 'desc' => 'Karim Benali hired Houda Cherkaoui for Senior Full-Stack Engineer',     'days' => 30, 'hours' => 6],
        ];

        foreach ($activities as $i => $act) {
            $createdAt = $now->copy()->subDays($act['days'])->subHours($act['hours']);
            DB::table('activities')->insert([
                'id'           => $i + 1,
                'company_id'   => 1,
                'user_id'      => $act['user_id'],
                'type'         => 'action',
                'subject_type' => 'App\\Models\\Application',
                'subject_id'   => $i + 1,
                'description'  => $act['desc'],
                'metadata'     => null,
                'created_at'   => $createdAt,
            ]);
        }

        $this->command->info('✓ Demo data seeded!');
        $this->command->info('  Login:  admin@kandid.com / password');
        $this->command->info('  Stats:  86 applications · 30 candidates · 8 job offers · 4 users');
        $this->command->info('  This week: ~18 apps (+125% vs last week)');
    }
}
