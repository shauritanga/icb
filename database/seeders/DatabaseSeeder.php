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
        // The demo admin account (with a weak password) is only created in local/testing
        // environments. Production deployments must create admin accounts manually via
        // `php artisan tinker` or a dedicated setup command with a strong password.
        if (app()->environment('local', 'testing')) {
            User::updateOrCreate(
                ['email' => 'admin@diticb.test'],
                ['name' => 'DIT ICB Admin', 'password' => Hash::make('password'), 'is_admin' => true]
            );
            $this->command?->warn('Demo admin created: admin@diticb.test / password — change this before deploying.');
        }

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
            ['Architectural Services',                'Project management, land use planning, architectural design, tendering, contract administration, valuations, claims assessment, final accounts, and handover reports.',                                                                          'Building2'],
            ['Mechanical Engineering Services',       'Design and supervision of air conditioning, ventilation, refrigeration, plumbing, water systems, lifts, standby power systems, fire systems, energy audits, and tender documents.',                                                            'Settings2'],
            ['Electrical Engineering Services',       'Design and supervision of lighting, switch gears, alarm systems, emergency lighting, solar street lighting, solar pumping systems, generators, energy audits, and electrical BoQs.',                                                          'Zap'],
            ['Civil and Structural Engineering Services', 'Topographical surveys, geotechnical investigation, drainage and water supply planning, structural design, condition surveys, structural assessment, supervision, and maintenance management.',                                             'HardHat'],
            ['Quantity Surveying Services',           'Cost advice, cost planning, estimates, financial feasibility, BoQs, schedules of rates, tendering, contractor selection, interim valuations, claims, and final accounts.',                                                                    'ClipboardList'],
            ['ICT and Laboratory Technology Services','Information and communication technology advisory, systems support, laboratory technology services, technical audits, and specialist project consulting.',                                                                                      'Monitor'],
        ];

        foreach ($services as $index => [$title, $summary, $icon]) {
            Service::updateOrCreate(['title->en' => $title], [
                'title' => ['en' => $title, 'sw' => $title],
                'summary' => ['en' => $summary, 'sw' => $summary],
                'body' => ['en' => '<p>'.$summary.'</p>', 'sw' => '<p>'.$summary.'</p>'],
                'icon' => $icon,
                'sort_order' => $index + 1,
                'is_featured' => $index < 4,
                'is_published' => true,
            ]);
        }

        $projects = [
            [
                'slug'    => 'tma-eastern-zone-office-building',
                'title'   => 'TMA Eastern Zone Office Building',
                'client'  => 'TMA',
                'value'   => null,
                'period'  => null,
                'desc'    => 'Geotechnical investigation, detailed design, tender document preparation, and construction supervision for the TMA Eastern Zone Office Building at Sinza, Dar es Salaam.',
                'status'  => 'ongoing',
                'image'   => 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'tia-mtwara-classroom-block',
                'title'   => 'TIA Mtwara Campus Classroom Block',
                'client'  => 'Rector TIA',
                'value'   => 'TZS 156,864,000',
                'period'  => 'June 2020 to February 2021',
                'desc'    => 'Consultancy services for geotechnical investigation, detailed design, and supervision of construction of one classroom block with four classes at Mjimwema Mtwara campus.',
                'status'  => 'completed',
                'image'   => 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'tia-mtwara-hostels-and-house',
                'title'   => 'TIA Mtwara Hostels and Semi-detached House',
                'client'  => 'Rector TIA',
                'value'   => 'TZS 193,572,800',
                'period'  => 'June 2020 to February 2021',
                'desc'    => 'Consultancy services for construction of a semi-detached house and two hostels for female and male students at Mjimwema Mtwara campus.',
                'status'  => 'completed',
                'image'   => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'viwango-house-dodoma',
                'title'   => 'Viwango House at Dodoma Capital City',
                'client'  => 'TBS',
                'value'   => 'TZS 402,110,000',
                'period'  => 'June 2020 to July 2021',
                'desc'    => 'Geotechnical investigation, detailed design, tender document preparation, construction documents, and supervision for Viwango House in Dodoma.',
                'status'  => 'ongoing',
                'image'   => 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'government-hangar-renovation',
                'title'   => 'Government Hangar Renovation at Airport Terminal 1',
                'client'  => 'TGFA',
                'value'   => 'TZS 139,387,500',
                'period'  => 'Jan 2020 to December 2020',
                'desc'    => 'Geotechnical investigation, detailed design, bidding documents, and supervision for renovation of the Government Hangar at Airport Terminal 1.',
                'status'  => 'completed',
                'image'   => 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'mbulu-district-council-headquarters',
                'title'   => 'Mbulu District Council Headquarters',
                'client'  => 'Mbulu DC',
                'value'   => 'TZS 381,000,000',
                'period'  => 'Jan 2019 to December 2020',
                'desc'    => 'Geotechnical investigation, detailed design, and supervision of construction of the proposed headquarters for Mbulu District Council.',
                'status'  => 'completed',
                'image'   => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
                ],
            ],
            [
                'slug'    => 'butiama-main-campus-master-plan',
                'title'   => 'Main Campus Master Plan at Butiama',
                'client'  => 'Ministry of Education',
                'value'   => 'TZS 183,036,000',
                'period'  => 'November 2019 to October 2020',
                'desc'    => 'Preparation of land utilization master plans for the proposed main campus of Mwalimu Julius K. Nyerere University of Agriculture and Technology at Butiama, Mara Region.',
                'status'  => 'completed',
                'image'   => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
                ],
            ],
        ];

        foreach ($projects as $p) {
            Project::updateOrCreate(['slug' => $p['slug']], [
                'title'          => ['en' => $p['title'],  'sw' => $p['title']],
                'client_name'    => $p['client'],
                'contract_value' => $p['value'],
                'project_period' => $p['period'],
                'description'    => ['en' => '<p>'.$p['desc'].'</p>', 'sw' => '<p>'.$p['desc'].'</p>'],
                'status'         => $p['status'],
                'image_path'     => $p['image'],
                'gallery_images' => $p['gallery'],
                'is_featured'    => true,
                'is_published'   => true,
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

        $newsPosts = [
            [
                'slug'         => 'dit-icb-wins-dodoma-infrastructure-tender',
                'title_en'     => 'DIT ICB wins major infrastructure design tender in Dodoma',
                'title_sw'     => 'DIT ICB inashinda zabuni kubwa ya usanifu wa miundombinu Dodoma',
                'excerpt_en'   => 'DIT Institute Consultancy Bureau has been awarded a significant contract to design and supervise road and drainage infrastructure works in the Dodoma Capital City Authority area.',
                'excerpt_sw'   => 'DIT ICB imepata mkataba mkubwa wa kusanifu na kusimamia miundombinu ya barabara na mifereji katika Mamlaka ya Mji wa Dodoma.',
                'body_en'      => '<p>The contract, valued at over TZS 450 million, covers the full design cycle including topographical surveys, drainage engineering, road pavement design, and construction supervision. Work is expected to begin in the third quarter of this year.</p><p>DIT ICB Director noted that the award reflects the bureau\'s growing reputation for delivering technically sound and cost-effective solutions on infrastructure projects across Tanzania.</p>',
                'body_sw'      => '<p>Mkataba huu, wenye thamani ya zaidi ya TZS milioni 450, unashughulikia mzunguko wote wa usanifu ikiwa ni pamoja na upimaji wa ardhi, uhandisi wa mifereji, usanifu wa barabara na usimamizi wa ujenzi.</p>',
                'image'        => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(1),
            ],
            [
                'slug'         => 'technical-training-workshop',
                'title_en'     => 'Event: Technical training workshop for project supervision teams',
                'title_sw'     => 'Tukio: Warsha ya mafunzo ya kiufundi kwa timu za usimamizi',
                'excerpt_en'   => 'DIT ICB will host a two-day practical workshop on project supervision, site safety reporting, and quality assurance for engineers and technicians.',
                'excerpt_sw'   => 'DIT ICB itaendesha warsha ya siku mbili ya vitendo kuhusu usimamizi wa miradi, usalama wa site na uhakiki wa ubora kwa wahandisi na mafundi.',
                'body_en'      => '<p>The workshop brings together engineers, technicians, and project coordinators from across the bureau\'s active assignments. Sessions will cover supervision workflows, technical documentation standards, quality control checkpoints, and client communication best practices.</p><p>Facilitators include senior engineers from DIT and guest experts from the Engineers Registration Board of Tanzania.</p>',
                'body_sw'      => '<p>Warsha hii inawakutanisha wahandisi, mafundi na waratibu wa miradi kutoka katika kazi zinazoendelea za bureau. Vipindi vitashughulikia mtiririko wa usimamizi, viwango vya nyaraka za kiufundi, hatua za uhakiki wa ubora na mazoea bora ya mawasiliano na wateja.</p>',
                'image'        => 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(3),
            ],
            [
                'slug'         => 'stakeholder-consultancy-forum',
                'title_en'     => 'Event: Stakeholder forum on engineering consultancy delivery',
                'title_sw'     => 'Tukio: Jukwaa la wadau kuhusu uwasilishaji wa ushauri wa kihandisi',
                'excerpt_en'   => 'The bureau is convening public and private sector partners to discuss engineering consultancy needs, procurement reforms, and collaborative delivery models.',
                'excerpt_sw'   => 'Bureau inawakutanisha wadau wa sekta ya umma na binafsi kujadili mahitaji ya ushauri wa kihandisi, mageuzi ya ununuzi na mifumo ya ushirikiano.',
                'body_en'      => '<p>The forum brings together government agencies, development partners, and private sector clients to review the current landscape of engineering consultancy in Tanzania. Key agenda items include procurement timelines, fee structures, capacity building, and digital project management tools.</p><p>DIT ICB will present case studies from recent assignments and invite open dialogue on improving project outcomes across the public infrastructure sector.</p>',
                'body_sw'      => '<p>Jukwaa hili linawakusanya mashirika ya serikali, washirika wa maendeleo na wateja wa sekta binafsi kupitia hali ya sasa ya ushauri wa kihandisi Tanzania.</p>',
                'image'        => 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(5),
            ],
            [
                'slug'         => 'site-inspection-mbulu-district',
                'title_en'     => 'Site inspection completed for Mbulu District Council headquarters',
                'title_sw'     => 'Ukaguzi wa site umekamilika kwa makao makuu ya Halmashauri ya Mbulu',
                'excerpt_en'   => 'DIT ICB engineers conducted a comprehensive structural and quality inspection of the ongoing Mbulu District Council headquarters construction project.',
                'excerpt_sw'   => 'Wahandisi wa DIT ICB walifanya ukaguzi wa kina wa kimuundo na ubora wa mradi unaoendelea wa ujenzi wa makao makuu ya Halmashauri ya Mbulu.',
                'body_en'      => '<p>The inspection team reviewed foundation works, structural framing, concrete quality, and drainage provisions at the Mbulu site. A detailed inspection report has been submitted to the client with recommendations for proceeding to the next phase.</p><p>The project remains on schedule for handover in the final quarter of the year, with all critical milestones met.</p>',
                'body_sw'      => '<p>Timu ya ukaguzi ilitathmini kazi za msingi, muundo wa fremu, ubora wa saruji na mifereji katika site ya Mbulu. Ripoti ya kina ya ukaguzi imewasilishwa kwa mteja pamoja na mapendekezo ya kuendelea na awamu inayofuata.</p>',
                'image'        => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(7),
            ],
            [
                'slug'         => 'icb-engineering-excellence-recognition',
                'title_en'     => 'DIT ICB recognised for engineering excellence at ERB annual awards',
                'title_sw'     => 'DIT ICB inatambuliwa kwa ubora wa uhandisi katika tuzo za mwaka za ERB',
                'excerpt_en'   => 'The Engineers Registration Board of Tanzania honoured DIT ICB with a commendation for outstanding contribution to public infrastructure consultancy in 2024.',
                'excerpt_sw'   => 'Bodi ya Usajili wa Wahandisi Tanzania ilimheshimu DIT ICB kwa pongezi kwa mchango bora kwa ushauri wa miundombinu ya umma mwaka 2024.',
                'body_en'      => '<p>The commendation acknowledges the bureau\'s consistent delivery of technically sound consultancy across structural engineering, roads, water, and building projects over the past year. The award was received by the ICB Manager at the annual ERB gala dinner in Dar es Salaam.</p><p>DIT ICB continues to uphold the highest standards of professional engineering practice in line with the ERB code of conduct and national infrastructure development objectives.</p>',
                'body_sw'      => '<p>Pongezi hizi zinatambua utoaji thabiti wa ushauri wenye ufundi wa kiufundi wa bureau katika uhandisi wa miundo, barabara, maji na miradi ya ujenzi katika mwaka uliopita.</p>',
                'image'        => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(10),
            ],
            [
                'slug'         => 'dit-icb-profile-published',
                'title_en'     => 'DIT ICB launches refreshed website with full bureau profile',
                'title_sw'     => 'DIT ICB inazindua tovuti mpya na wasifu kamili wa bureau',
                'excerpt_en'   => 'The bureau has launched an updated website featuring its full profile, service offerings, project portfolio, staff directory, and a bilingual content management system.',
                'excerpt_sw'   => 'Bureau imezindua tovuti iliyosasishwa inayoonyesha wasifu wake kamili, huduma, portfolio ya miradi, orodha ya watumishi na mfumo wa usimamizi wa maudhui kwa lugha mbili.',
                'body_en'      => '<p>The new platform is powered by a custom content management system that allows administrators to update all public-facing content in both English and Swahili. The website showcases the bureau\'s engineering expertise across architectural, civil, structural, mechanical, electrical, and ICT disciplines.</p><p>Clients and partners can now access the latest project updates, service descriptions, and contact information directly from the public website.</p>',
                'body_sw'      => '<p>Jukwaa jipya linaendeshwa na mfumo maalum wa usimamizi wa maudhui ambao unawawezesha wasimamizi kusasisha maudhui yote yanayoonekana kwa umma kwa Kiingereza na Kiswahili.</p>',
                'image'        => 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80',
                'published_at' => now()->subDays(14),
            ],
        ];

        foreach ($newsPosts as $n) {
            NewsPost::updateOrCreate(['slug' => $n['slug']], [
                'title'        => ['en' => $n['title_en'],   'sw' => $n['title_sw']],
                'excerpt'      => ['en' => $n['excerpt_en'], 'sw' => $n['excerpt_sw']],
                'body'         => ['en' => $n['body_en'],    'sw' => $n['body_sw']],
                'image_path'   => $n['image'],
                'published_at' => $n['published_at'],
                'is_published' => true,
            ]);
        }
    }
}
