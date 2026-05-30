<?php

namespace Database\Seeders;

use App\Models\NewsPost;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\StaffMember;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@diticb.test'],
            ['name' => 'DIT ICB Admin', 'password' => Hash::make('password')]
        );

        $settings = [
            'phone' => ['en' => '+255 752 151118', 'sw' => '+255 752 151118'],
            'email' => ['en' => 'icb@dit.ac.tz', 'sw' => 'icb@dit.ac.tz'],
            'website' => ['en' => 'https://www.dit.ac.tz', 'sw' => 'https://www.dit.ac.tz'],
            'address' => [
                'en' => 'Dar es Salaam Institute of Technology, Junction of Bibi Titi Mohamed Street and Morogoro Road, P.O. Box 2958, Dar es Salaam, Tanzania',
                'sw' => 'Taasisi ya Teknolojia Dar es Salaam, makutano ya Barabara ya Bibi Titi Mohamed na Morogoro, S.L.P. 2958, Dar es Salaam, Tanzania',
            ],
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Page::updateOrCreate(['slug' => 'about'], [
            'title' => ['en' => 'About DIT ICB', 'sw' => 'Kuhusu DIT ICB'],
            'excerpt' => [
                'en' => 'DIT Institute Consultancy Bureau is an engineering consulting firm based at Dar es Salaam Institute of Technology.',
                'sw' => 'DIT Institute Consultancy Bureau ni taasisi ya ushauri wa kihandisi iliyopo Dar es Salaam Institute of Technology.',
            ],
            'body' => [
                'en' => '<p>DIT Institute Consultancy Bureau is an Engineering Consulting firm based in Dar es Salaam Institute of Technology in Tanzania. The Bureau is registered with the Engineers Registration Board of Tanzania and provides services ranging from feasibility studies and cost appraisal to technical audits, design, supervision, ICT services, and laboratory technology services.</p><p>The Bureau was established in December 2012 and registered in the same year by the Engineers Registration Board with registration number 057. It works through experienced engineers, technologists, architects, environmental specialists, and quantity surveyors.</p>',
                'sw' => '<p>DIT Institute Consultancy Bureau ni taasisi ya ushauri wa kihandisi iliyopo Dar es Salaam Institute of Technology nchini Tanzania. ICB imesajiliwa na Engineers Registration Board ya Tanzania na hutoa huduma za upembuzi yakinifu, tathmini ya gharama, ukaguzi wa kiufundi, usanifu, usimamizi, TEHAMA na huduma za teknolojia ya maabara.</p>',
            ],
            'is_published' => true,
        ]);

        Page::updateOrCreate(['slug' => 'bureau-profile'], [
            'title' => ['en' => 'Bureau Profile', 'sw' => 'Wasifu wa Bureau'],
            'excerpt' => [
                'en' => 'A multidisciplinary consultancy bureau equipped for engineering design, supervision, audits, and advisory assignments.',
                'sw' => 'Bureau ya taaluma mbalimbali inayotekeleza usanifu, usimamizi, ukaguzi na ushauri wa kitaalamu.',
            ],
            'body' => [
                'en' => '<p>The Bureau is equipped with modern computers and integrated design, drafting, and detailing software including AutoCAD, Revit Architecture, STAAD PRO, Mathcad, and Matlab. The office also maintains drawing tables, printers, photocopiers, scanners, and related project delivery equipment.</p><p>Its structure links management, team leaders, architectural experts, civil and structural engineering experts, mechanical engineering experts, electrical engineering experts, ICT experts, professional engineers, and technicians.</p>',
                'sw' => '<p>Bureau ina vifaa vya kisasa vya kompyuta na programu za usanifu, uchoraji na uchambuzi kama AutoCAD, Revit Architecture, STAAD PRO, Mathcad na Matlab. Muundo wake unaunganisha menejimenti, viongozi wa timu na wataalamu wa taaluma mbalimbali.</p>',
            ],
            'is_published' => true,
        ]);

        $services = [
            ['Architectural Services', 'Project management, land use planning, architectural design, tendering, contract administration, valuations, claims assessment, final accounts, and handover reports.'],
            ['Mechanical Engineering Services', 'Design and supervision of air conditioning, ventilation, refrigeration, plumbing, water systems, lifts, standby power systems, fire systems, energy audits, and tender documents.'],
            ['Electrical Engineering Services', 'Design and supervision of lighting, switch gears, alarm systems, emergency lighting, solar street lighting, solar pumping systems, generators, energy audits, and electrical BoQs.'],
            ['Civil and Structural Engineering Services', 'Topographical surveys, geotechnical investigation, drainage and water supply planning, structural design, condition surveys, structural assessment, supervision, and maintenance management.'],
            ['Quantity Surveying Services', 'Cost advice, cost planning, estimates, financial feasibility, BoQs, schedules of rates, tendering, contractor selection, interim valuations, claims, and final accounts.'],
            ['ICT and Laboratory Technology Services', 'Information and communication technology advisory, systems support, laboratory technology services, technical audits, and specialist project consulting.'],
        ];

        foreach ($services as $index => [$title, $summary]) {
            Service::updateOrCreate(['title->en' => $title], [
                'title' => ['en' => $title, 'sw' => $title],
                'summary' => ['en' => $summary, 'sw' => $summary],
                'body' => ['en' => '<p>'.$summary.'</p>', 'sw' => '<p>'.$summary.'</p>'],
                'sort_order' => $index + 1,
                'is_featured' => $index < 4,
                'is_published' => true,
            ]);
        }

        $projects = [
            ['tma-eastern-zone-office-building', 'TMA Eastern Zone Office Building', 'TMA', null, null, 'Geotechnical investigation, detailed design, tender document preparation, and construction supervision for the TMA Eastern Zone Office Building at Sinza, Dar es Salaam.', 'Ongoing'],
            ['tia-mtwara-classroom-block', 'TIA Mtwara Campus Classroom Block', 'Rector TIA', 'TZS 156,864,000', 'June 2020 to February 2021', 'Consultancy services for geotechnical investigation, detailed design, and supervision of construction of one classroom block with four classes at Mjimwema Mtwara campus.', 'Ongoing'],
            ['tia-mtwara-hostels-and-house', 'TIA Mtwara Hostels and Semi-detached House', 'Rector TIA', 'TZS 193,572,800', 'June 2020 to February 2021', 'Consultancy services for construction of a semi-detached house and two hostels for female and male students at Mjimwema Mtwara campus.', 'Ongoing'],
            ['viwango-house-dodoma', 'Viwango House at Dodoma Capital City', 'TBS', 'TZS 402,110,000', 'June 2020 to July 2021', 'Geotechnical investigation, detailed design, tender document preparation, construction documents, and supervision for Viwango House in Dodoma.', 'Ongoing'],
            ['government-hangar-renovation', 'Government Hangar Renovation at Airport Terminal 1', 'TGFA', 'TZS 139,387,500', 'Jan 2020 to December 2020', 'Geotechnical investigation, detailed design, bidding documents, and supervision for renovation of the Government Hangar at Airport Terminal 1.', 'Design Completed'],
            ['mbulu-district-council-headquarters', 'Mbulu District Council Headquarters', 'Mbulu DC', 'TZS 381,000,000', 'Jan 2019 to December 2020', 'Geotechnical investigation, detailed design, and supervision of construction of the proposed headquarters for Mbulu District Council.', 'Supervision in Progress'],
            ['butiama-main-campus-master-plan', 'Main Campus Master Plan at Butiama', 'Ministry of Education', 'TZS 183,036,000', 'November 2019 to October 2020', 'Preparation of land utilization master plans for the proposed main campus of Mwalimu Julius K. Nyerere University of Agriculture and Technology at Butiama, Mara Region.', 'Completed'],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(['slug' => $project[0]], [
                'title' => ['en' => $project[1], 'sw' => $project[1]],
                'client_name' => $project[2],
                'contract_value' => $project[3],
                'project_period' => $project[4],
                'description' => ['en' => '<p>'.$project[5].'</p>', 'sw' => '<p>'.$project[5].'</p>'],
                'status' => $project[6],
                'is_featured' => true,
                'is_published' => true,
            ]);
        }

        $staff = [
            ['Eng. Dr. Johnson Malisa', 'DIT ICB Manager', 'Civil Engineer', 'PhD, UDSM/NTNU; Registered Professional Civil Engineer (ERB)', '20 Years'],
            ['Eng. Dr. Mashauri Kusekwa', 'Board Member', 'Electrical Engineer', null, '30 Years'],
            ['Eng. Prof. Christian Nyahumwa', 'Board Member', 'Mechanical Engineer', null, '35 Years'],
            ['Eng. Julius Chacha', 'Board Member', 'Civil Engineer', null, '10 Years'],
            ['Eng. Dr. Joseph Mkilania', 'Mechanical Engineer', 'Mechanical Engineer', null, '35 Years'],
            ['Arch. Anderson Allen', 'Bureau Architect', 'Architect', null, '10 Years'],
            ['QS. Advengtina Ndibalema', 'Bureau QS', 'Quantity Surveyor', null, '20 Years'],
            ['Dr. Joseph Matiko', 'ICT Expert', 'ICT Expert', null, '15 Years'],
        ];

        foreach ($staff as $index => [$name, $position, $profession, $qualification, $experience]) {
            StaffMember::updateOrCreate(['name' => $name], [
                'position' => ['en' => $position, 'sw' => $position],
                'profession' => $profession,
                'qualification' => $qualification,
                'experience' => $experience,
                'sort_order' => $index + 1,
                'is_published' => true,
            ]);
        }

        NewsPost::updateOrCreate(['slug' => 'dit-icb-profile-published'], [
            'title' => ['en' => 'DIT ICB profile content added to the new website', 'sw' => 'Wasifu wa DIT ICB umeongezwa kwenye tovuti mpya'],
            'excerpt' => ['en' => 'The website now includes the bureau profile, services, staff, and selected projects from the institutional profile document.', 'sw' => 'Tovuti sasa ina wasifu wa bureau, huduma, watumishi na miradi iliyochaguliwa kutoka kwenye nyaraka ya taasisi.'],
            'body' => ['en' => '<p>The initial CMS content is based on the DIT ICB company profile document and can be updated by administrators from the admin panel.</p>', 'sw' => '<p>Maudhui ya awali ya CMS yametokana na nyaraka ya wasifu wa DIT ICB na yanaweza kuhaririwa na wasimamizi kupitia admin panel.</p>'],
            'published_at' => now(),
            'is_published' => true,
        ]);
    }
}
