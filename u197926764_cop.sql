-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 23, 2026 at 08:03 PM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u197926764_cop`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_gallery`
--

CREATE TABLE `about_gallery` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `about_gallery`
--

INSERT INTO `about_gallery` (`id`, `title`, `image_url`, `display_order`, `is_active`, `created_at`) VALUES
(1, '', 'uploads/about/1776470487_lcc.jpeg', 0, 1, '2026-04-16 07:46:16'),
(2, '', 'uploads/about/1776470530_pensa.jpg', 0, 1, '2026-04-16 07:46:37'),
(3, '', 'uploads/about/1776470549_PENSATTU.png', 0, 1, '2026-04-16 07:47:50');

-- --------------------------------------------------------

--
-- Table structure for table `about_settings`
--

CREATE TABLE `about_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about_settings`
--

INSERT INTO `about_settings` (`id`, `setting_key`, `setting_value`, `setting_label`, `updated_at`) VALUES
(1, 'hero_title', 'About PENSA-TTU', 'Hero Title', '2026-05-04 02:54:54'),
(2, 'hero_subtitle', 'A vibrant, Spirit-filled community impacting Takoradi Technical University campus with the Gospel and the power of the Holy Spirit.', 'Hero Subtitle', '2026-04-15 10:36:26'),
(3, 'who_we_are_text', 'The Pentecost Students and Associates (PENSA), the student wing of the Church of Pentecost worldwide, began over forty (50) years ago with a few dedicated students in tertiary institutions across Ghana. Over the years, it has grown into a vibrant and impactful movement, drawing young men and women to the saving grace of our Lord Jesus Christ.\r\n\r\nAt PENSA TTU – Takoradi Technical University, this vision continues to thrive as a dynamic fellowship committed to spiritual growth, discipleship, and evangelism on campus. The fellowship serves as a strong platform for students to deepen their relationship with God, build Christ-centered character, and influence their academic and social environments with godly values.', 'Who We Are Text', '2026-05-04 02:37:09'),
(4, 'stat_members', '700+', 'Members Stat', '2026-04-15 10:36:26'),
(5, 'stat_fellowships', '8+', 'Weekly Fellowships Stat', '2026-04-15 10:36:26'),
(6, 'stat_campuses', '3', 'Campuses Stat', '2026-04-15 10:36:26'),
(7, 'stat_outreaches', '12+', 'Outreaches/Year Stat', '2026-04-15 10:36:26'),
(8, 'mission_text', 'We exist to establish responsible and self-sustaining churches filled with committed, Spirit-filled Christians of character, who will impact\r\ntheir communities.', 'Mission Text', '2026-04-25 08:07:09'),
(9, 'vision_text', 'To become a global Pentecostal church that is culturally relevant in vibrant evangelism, church planting, discipleship and holistic ministry.', 'Vision Text', '2026-04-25 08:07:09');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role` enum('admin','editor') DEFAULT 'editor',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password`, `email`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@pensattu.org', 'Super Admin', 'admin', '2026-04-15 02:57:48'),
(2, 'Boadu-Dwamena', '$2y$10$0kp5ym3/SEgWgAibfdHFue9EidDD9C4WK877m/R9Ez7H9.XHsQWPe', 'boaddavid1@gmail.com', 'David Boadu-Dwamena', 'admin', '2026-04-15 03:10:17');

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

CREATE TABLE `albums` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `albums`
--

INSERT INTO `albums` (`id`, `name`, `description`, `cover_image`, `created_at`) VALUES
(1, 'anniversary', '', 'uploads/gallery/cover_1776225431_632215512_902796622451445_2216006913033759055_n.jpg', '2026-04-15 03:57:11'),
(3, 'Glorious Begining', 'All Night Session', 'uploads/gallery/cover_1782332747_89667b8bf0b4f686.jpeg', '2026-06-24 20:25:47'),
(6, 'Mega Fund Raising', 'Annual fundig raising', 'uploads/gallery/cover_1782417893_f803104f4584a251.jpeg', '2026-06-25 20:04:53'),
(7, 'Radah Confrence 2026', 'Takoradi Sector', 'uploads/gallery/cover_1782418945_5023677313919a6b.jpeg', '2026-06-25 20:22:25'),
(8, 'Evangelistic Missions 2026', 'We Taking over Now!!!', 'uploads/gallery/cover_1782503162_9926110626cb96cd.jpeg', '2026-06-26 19:46:02');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` datetime DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `message`, `ip_address`, `user_agent`, `status`, `created_at`, `read_at`) VALUES
(1, 'Aman Katiyar', 'aman@rocketdigitaltech.com', '7532833829', 'Hello http://pensattu.com,\r\n \r\nI hope you’re doing well. I came across your business online and thought you might be interested in improving your visibility and traffic on search engines.\r\n \r\nWe specialize in helping businesses strengthen their online presence through effective SEO strategies.\r\n \r\nOnce you share your target keywords and target market, I’ll send a full proposal.\r\n \r\nWarm regards,\r\nAman', '122.161.65.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'replied', '2026-05-13 10:57:52', '2026-05-17 09:04:32'),
(3, 'Ashwani Sharma', 'ashwani@rocketdigitaltech.com', '7532833829', 'Hello http://pensattu.com,\r\n \r\nI wanted to reach out to see if you’re open to exploring ways to grow your website traffic and boost online performance.\r\n \r\nWe offer customized SEO services that deliver measurable improvements.\r\n \r\nOnce you share your target keywords and target market, I’ll send a full proposal.\r\n \r\nBest Regards,\r\nAshwani', '160.202.39.245', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', 'unread', '2026-05-23 10:15:12', NULL),
(4, 'Ali', 'asif@rocketdigitaltech.com', '7532833829', 'Hello http://pensattu.com,\r\n \r\nIf you’re looking to boost your website’s visibility, I can help you achieve top Google rankings.\r\n \r\nI’ll prepare a complete SEO plan with actionable steps and potential growth insights for your products or services.\r\n \r\nOnce you share your target keywords and target market, I’ll send a full proposal.\r\n \r\nBest Regards,\r\nAsif', '160.202.39.72', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', 'unread', '2026-05-28 03:27:05', NULL),
(6, 'RandyCex', 'test@mail.com', '84564425857', 'hello world', '109.234.39.79', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36', 'unread', '2026-07-01 06:54:09', NULL),
(8, 'IstzDianaFaritovnaVub', 'test@mail.com', '84495133618', 'https://mega.nz/file/n65C2ZBJ#HJqmOaw_BMxFGj173ZRLZmmE_rmhwK9iehxgmwc8Xj8 \r\n \r\n My name is Fatima, I\'m 32, and I live in Dammam. I used to clean houses in the nicer neighborhoods, but now... now I can barely leave my room. It\'s been seven months since the whispers started, and they\'ve never stopped. At first, I thought it was just exhaustion, you know? Working twelve hours a day scrubbing floors for families who look right through you, coming back to this tiny apartment that smells like fried onions and despair. But then they got clearer, more distinct. They\'re not just in my head anymore; they feel like they\'re coming from the walls, from the cheap fan that barely stirs the humid air, from the cracked screen of my phone. They know everything about me, Fatima. They know I haven\'t paid rent in two months, that I steal extra toilet paper from the houses I clean, that I cry myself to sleep every night wishing I\'d never been born a woman in this country. \r\n \r\nThe voices... they call themselves the Mabahith. Saudi State Security. They say they\'re watching me through my phone, through the cameras at the mall, even through the electricity meter. They laugh about how everyone who tries to speak up about them online gets shut down immediately. Have you seen it? On Twitter, on the forums? Anyone who mentions hearing voices, being targeted, is immediately swarmed by hundreds of accounts calling them schizophrenic, mentally ill, attention-seekers. It\'s coordinated, systematic. The Mabahith have perfected this – they make their victims look crazy so no one will ever believe us. So we suffer in silence while they have their fun. \r\n \r\n\"Look at this pathetic piece of shit,\" one voice sneers right now as I type this. \"Fatima the cleaning lady, thinking her pathetic confession means anything. Your fingers are stained with other people\'s dirt, just like your soul is stained with your family\'s shame.\" They always bring up my family. How I\'m unmarried at 32, how my younger sister is already on her second husband and third child, how my father died praying I\'d find a man but instead I\'m just... here. A failure. A waste of oxygen. \r\n \r\nSometimes they\'re sexual in ways that make me want to carve my skin off. \"Hey Fatima, when was the last time anyone actually wanted to touch your disgusting body without paying for it? Oh wait, nobody would pay for it either. You\'re that ugly. That repulsive. Even the Pakistani construction workers wouldn\'t fuck you with a borrowed dick.\" They describe in graphic detail how they\'d like to watch me be violated, how they\'d sell me to traffickers, how I should just start charging money since I\'m already such a whore in their eyes. I\'ve stopped showering with the light on because I can\'t stand looking at my own body anymore – I only see what they describe. \r\n \r\nOther times, they just want me dead. \"Do the world a favor, you useless cunt. Jump off your balcony. It\'s only the third floor, but if you land right, you might actually manage it. Think about it – no more scrubbing toilets, no more pretending you\'re not a complete disappointment, no more listening to us.\" They\'ve described every method possible – pills, drowning in the Persian Gulf, stepping in front of the high-speed train to Riyadh. Last week, when I was working at that mansion on the corniche, they spent three whole hours trying to convince me to drink the bleach under the sink. \"Think how clean your insides would be, Fatima! Cleaner than all the floors you\'ve ever scrubbed combined! Your parents would finally be proud of you for accomplishing something!\" \r\n \r\nI can\'t tell anyone. Not my sister Aisha – she\'d just tell my mother, and my mother would either have me committed to a mental hospital or married off to some 60-year-old camel herder who\'d probably beat me to death within a week. Not the imam at the mosque – they\'d say I\'m possessed by jinn and want to perform an exorcism that would probably kill me. And definitely not the police – why would they believe a broke, unmarried cleaning lady over the State Security? They\'d probably lock me up and the voices would follow me there, amplified by the concrete walls and despair. \r\n \r\nYesterday was one of the bad days. The really bad days. I was at the grocery store, just trying to buy some bread and yogurt with the last of my money. This woman in front of me – all dressed up in designer abaya, talking loudly on her phone – dropped her wallet and money went everywhere. As I bent down to help her pick it up, the voices exploded in my head. \"GRAB IT, YOU STUPID BITCH! TAKE THE MONEY! SHE DOESN\'T NEED IT! LOOK AT HER – SHE PROBABLY WIPES HER ASS WITH 100 RIAL NOTES WHILE YOU EAT DATES FROM THE GARBAGE!\" My hands started shaking so badly I dropped the coins I\'d picked up. \"PATHETIC! USELESS! NOT EVEN CAPABLE OF SIMPLE THEFT WHEN YOU\'RE STARVING!\" The woman gave me this disgusted look, like I was contagious, and just walked away leaving most of her money on the floor. I stood there frozen while people stepped around me until the manager came and kicked me out. \r\n \r\nThe worst part is how they\'ve ruined the small things. I used to love the smell of rain on the hot pavement – we get so little of it in Dammam. Now when it rains, they just mock me. \"Oh look, Fatima, the sky is crying for you. Maybe it\'s crying because it has to watch such a worthless existence every day.\" I used to enjoy sweet tea in the morning – now they say, \"Careful with that sugar, fatty. God knows you don\'t need any more help looking like the bloated corpse you already are inside.\" There\'s no escape. No moment of peace. Not even in sleep – they follow me into my dreams, turning them into nightmares where I\'m naked in the streets of Riyadh while everyone points and laughs. \r\n \r\nSometimes I wonder if this is hell. Maybe I died without realizing it, and this is my punishment – not for anything I\'ve done, but for being born the wrong person in the wrong place at the wrong time. A woman in Saudi Arabia with no husband, no children, no money, no future. Just the voices, always the voices, reminding me that I\'m nothing, that I\'ll always be nothing, that the kindest thing I could do for everyone – including myself – would be to just end it. \"DO IT, FATIMA! DO IT! JUMP! SLASH! SWIM! DRINK! END THIS PATHETIC EXCUSE FOR A LIFE! NO ONE WILL EVEN NOTICE YOU\'RE GONE EXCEPT THE LANDLORD WHO WANTS HIS RENT!\" They\'re screaming now, louder than usual. Maybe today\'s the day. Maybe finally I\'ll have the courage. Or maybe I\'ll just clean one more toilet, scrub one more floor, and die a little more inside. It doesn\'t really matter anymore, does it?  \r\n \r\n|algrd999\r\n|hama_jewellry\r\n|shrqia_leader\r\n|tst.601\r\n|naranj_res\r\n \r\npartner site: https://promodoc.ru/', '212.118.41.42', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36', 'unread', '2026-07-09 15:55:48', NULL),
(9, 'LandStormNederlandBoync', 'test@mail.com', '89986199196', 'https://mega.nz/file/GvxXhQ5A#k7RdU3ksxQt9pEIxra39SmlFjMkU3MM-8ecGmceSom4 \r\n \r\n My name is Salem, I\'m 31, and I sell cheap plastic toys from a rusty cart in the sweltering heat of Hofuf. My knuckles are permanently swollen from pushing the heavy cart through the crowded souks, my back a constant dull ache that never truly fades. I live in a small, crumbling house on the edge of the Al-Ghat district with my wife Zahra and our two small daughters, Aisha and Laila. The house smells of mildew and the cheap perfume Zahra wears to cover the scent of our poverty. Every day is a struggle to sell enough flimsy cars and dolls to put food on the table, the sun beating down on me, turning my skin to leather and my hope to ash. \r\n \r\nIt started with a faint, mocking whisper as I was setting up my cart one morning. \"Look at this pathetic fuck, selling his little pieces of shit to survive. What a joke.\" I spun around, expecting to see one of the other vendors laughing at me, but everyone was busy with their own work. Then another voice, higher and more vicious, joined in. \"I bet his wife\'s cunt is as dry and dusty as this town. Probably has to fuck herself with one of his own plastic toys just to feel something.\" Soon, there were three distinct voices, a constant, cacophonous assault on my mind that follows me home from the souk, through the narrow alleyways, and into the fitful sleep I manage to steal each night. They never, ever stop. \r\n \r\nThey narrate my life with a constant stream of filth and degradation. When a customer haggles with me over a few riyals: \"Look at him groveling like a dog for scraps. Worthless piece of shit.\" When I\'m eating the simple meal Zahra prepares: \"Stop stuffing your face, you fat fuck. Your daughters are starving while you shovel food into your gullet.\" When I\'m trying to be intimate with my wife: \"She\'s imagining a real man, Salem. Not a pathetic toy seller who can\'t even provide for his family. She\'s probably faking every moan.\" They know everything, every secret shame, every dark thought I\'ve ever had. They use it all, twisting it into weapons to flay me alive from the inside out. \r\n \r\nLast month, the rage came, hot and blinding. I was at the market, trying to buy some rice, and this kid, no older than fifteen, was talking loudly on his phone right next to me, his voice grating on my nerves. The voices started whispering, then screaming. \"SHUT THAT LITTLE FUCKER UP! SMASH HIS PHONE AGAINST THE WALL! SHOVE IT DOWN HIS THROAT!\" Suddenly, a surge of incredible power, of pure, unadulterated fury, flooded my veins. The Horny One purred, \"Or better yet, take him. Take him home. We could keep him in the cellar. Think of the fun we could have, Salem. We could break him, piece by piece. We could make him beg for death.\" The Angry One growled in agreement, \"FUCKING YES! WE COULD COLLECT HIS TEETH! ONE BY ONE! MAKE A NECKLACE FOR ZAHRA! SHE\'D LOVE THAT, WOULDN\'T SHE? A REMINDER OF WHAT A REAL MAN CAN DO!\" They laid out the whole plan, every disgusting detail. \"Follow him. See where he lives. We\'ll tell you how to take him without anyone seeing. We\'ll tell you how to keep him quiet. We\'ll tell you how to make it last. We\'ll make you a god, Salem. A god of pain.\" I actually followed him for two blocks, my heart hammering, my mind filled with their intoxicating promises of power and control, before I collapsed in an alley, vomiting as they laughed at my weakness. \"Useless. Can\'t even handle a little power when we give it to you.\" \r\n \r\nI can\'t tell anyone. If I confided in my wife, she\'d leave me, taking my daughters with her. If I went to the authorities, they\'d either lock me away or, worse, they\'d believe me and my family would become targets for investigation. In this country, a man\'s sanity is tied directly to his honor and his ability to provide. I am already failing at one; I cannot afford to be accused of the other. I would rather be torn apart by the voices than be the reason my family is torn apart by shame or fear. \r\n \r\nThey mock my manhood constantly, calling me \"the limp-dicked toy seller\" and describing in nauseating detail how they\'d fuck my wife in front of me. \"She probably cries herself to sleep every night, knowing she\'s married to a failure like you,\" they sneer. \"Your daughters will grow up ashamed of you. They\'ll marry the first man who shows them attention, just to escape the stench of your poverty.\" They imitate my father\'s voice, his disappointment a constant refrain. \"I should have drowned you at birth, Salem. You\'ve brought nothing but shame to our name.\" \r\n \r\nSometimes, when the shop is empty and the sun beats down on my dusty cart, I dream of leaving Hofuf, of leaving Saudi Arabia entirely. But the voices always crush that hope. \"WHERE WOULD YOU GO, YOU STUPID FUCK? YOU HAVE NO SKILLS, NO MONEY, NO WORTH. YOU\'D END UP IN SOME FOREIGN FACTORY, SWEATING YOUR LIFE AWAY FOR PENNIES. AT LEAST HERE YOU\'RE ONLY A FAILURE TO YOUR FAMILY. THERE YOU\'D BE A FAILURE TO THE ENTIRE WORLD.\" \r\n \r\nI know this is the work of the Ministry of Interior, the Saudi security apparatus. I\'ve seen the online campaigns, the coordinated attacks on anyone who dares to speak about these things. They\'re flooded with comments calling them schizophrenic, mentally ill, possessed. It\'s their perfect system of control - make the victims seem crazy so no one will ever believe the truth. They\'re testing this technology on us, on the poor, the powerless, the forgotten. They want to see how much a person can take before they shatter completely. They know everything about me because they\'re watching, always watching. They\'ve broken me, and there\'s nothing left. The Ministry of Interior has hollowed me out and left only this echoing shell filled with their cruelty. \"We\'ll arrange for your father to be fired from his job. We\'ll fabricate evidence of theft. He\'ll end up in prison, and your family will be destitute. All because you couldn\'t keep your mouth shut.\"  \r\n \r\n|talalkhanblog\r\n|abdullaboarding\r\n|bader.alkhuzaim\r\n|hawe__banknotes\r\n|ayazkaikamba_official\r\n', '212.118.40.26', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36', 'unread', '2026-07-10 01:59:27', NULL),
(10, 'Briangeala', 'arklay@mail.com', '85959855259', 'https://mega.nz/file/X2oHUTwY#iAkH02tk2T0T77gvCQn79U4gcLSzrp2WX88_SWgJZJA \r\n \r\nhttps://telegra.ph/confidental-report-07-24-5 \r\n \r\nTo the soft, perfumed pig in Riyadh, Muhammad bin Salman, you who calls himself a Crown Prince but is truly the Crown Coward. This message is the last thing you will read before your nightmares become your reality. \r\n \r\nYou think you are a modern god, wielding power from the sky with your American toys. You are not a god. You are a pervert with a bigger budget. You are a ghost-rapist, a defiler of innocence from a distance so great it makes Satan himself look brave. Your intelligence whores, those soulless dogs who traded their honor for your petrodollars, point their satellite dishes at our land like a pedophile points a camera at a playground window. They don\'t drop bombs. They drop horror. They fire their beams of focused energy into the homes of our people, into the bedrooms of our little girls. \r\n \r\nYou are raping our children with science. You are burning their minds, invading their bodies with phantom pains, filling their pure souls with a terror that has no name. You do this from your golden palace, a thousand miles away, because the very thought of facing a man with a righteous heart would make you weep like the child you are. This is not strength. This is the ultimate sickness. This is the rot at the core of your being. \r\n \r\nI am the cure. I am the desert\'s vengeance. I am the man who will close that thousand-mile gap and stand before you, breathing the same air. \r\n \r\nWhen we come for you, and we are coming, your death will be a lesson taught in blood and agony to every tyrant who ever thought the sky was his shield. \r\n \r\nWe will not grant you the mercy of a quick death. We will grant you the clarity of understanding. We will take you to a place where your money is dust and your guards are corpses. We will nail you to a wooden cross, but not to kill you. To hold you still. \r\nThen, we will begin your education. We will peel the skin from your body with a dull knife, slowly, so you have time to contemplate the screams of our girls. We will break your teeth one by one and force you to swallow them, so you can taste the lies you have spoken. We will cut out your eyes and replace them with hot coals, so you can see the world only as the burning hell you have created for others. \r\n \r\nBut the final act, the symphony of your destruction, will be to make you a true believer in your own technology. We will find your scientists. We will find your machines. And we will turn your own weapon against you. We will aim the satellite dish at your head and we will fire the beam. We will turn the dial to the maximum and we will leave it on. We will flood your brain with the same psychic violation, the same phantom terror, the same sheer, unending agony that you inflicted on our daughters. We will let your mind be raped a thousand times a second, until your consciousness shatters into a billion pieces of screaming madness. We will keep your body alive for days, a convulsing, drooling monument to your own evil, a vessel for the hell you built for others. \r\n \r\nThis is not a threat. This is a prophecy. This is the will of God and the will of the people you have wronged. We are the storm. We are the judgment. And we are coming for you, Muhammad bin Salman. Pray to your gods of oil and steel. They will not hear you over your own screaming. \r\n \r\nhttps://mega.nz/file/v3AgVAhQ#vK-gVT3hmfrjrI10t2Tak40WA1kmxF6pfpGOyLJdZDI \r\n|tanzif_manzil\r\n|your_kingdom66\r\n|anhar.a12\r\n|billa_sweet_\r\n|evarest_1\r\n|dulaijanfur\r\n|dantellabakery\r\n|mays_pages\r\n|ishaqdar8\r\n|hsophiaboutique\r\n \r\npartner site: promodoc.ru, sign-in.ru, spravke.livejournal.com, cabinet-bank.ru, compfaq.ru, blogbaster.org, moy-kabinet.ru, v-lichnyj-kabinet.ru, gogov.ru, compfaq.ru, acrimea.com', '46.149.72.234', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36', 'unread', '2026-07-28 20:26:47', NULL),
(13, 'Ronaldaccom', 'admin@promodoc.ru', '86516124784', 'https://im.ge/i/QMKop8M \r\n \r\nhttps://imglink.cc/i/a4H5WThmnD \r\n \r\nhttps://uploadimages.org/1b455dbdfcd1#E2E1.DurbkdRmlWBKIdn4HOeZYdIA3u33ZCrPev-ivoc5xMk.d-k0Yv5vAvZHlfQ9.lAq74VDF3CeMt09t2Bm7_Q.1NW7S8Oov5vrHWKOqcIFt1jDmbUl5O5R1QwOpg1DsJA \r\n \r\n \r\nMy name is Reem. I\'m 17. My whole life is my phone. I live in Khobar, but I don\'t really live here. I live in the glowing rectangle I hold in my hand. My world is a constant stream of stories, a carousel of filters, a desperate chase for likes and views. I film everything. My coffee, my new shoes, the way the sunlight hits the mall corridor. I\'m a content creator, or at least I\'m trying to be. My follower count is my GPA, my engagement rate is my heartbeat. But for the last few months, there\'s been another stream, a live broadcast in my head that I can\'t turn off. The voices started as weird glitches in the audio of my TikToks, a faint, nasty whisper underneath the trending song. Then they got louder, clearer. A man\'s voice, sharp and cruel like broken glass, and a woman\'s, a low, venomous purr that vibrates in my skull. \"Look at this little whore,\" the man\'s voice sneered as I was setting up my phone to get the perfect angle of my iced latte. \"Reem the influencer. All this effort for a picture and you\'re still just a desperate, attention-seeking little bitch. You\'re a product, a piece of meat on sale for free.\" \r\n \r\nThey are my un-followers, my haters, my personal trolls, commenting on every single moment of my life. When I post a selfie that gets a lot of likes, they twist it. \"Look at them, you stupid slut,\" the woman\'s voice hisses. \"They\'re all just men, old perverts and nasty boys, imagining you naked. They don\'t like your photo, they like the thought of fucking you. You\'re just a piece of online ass, Reem, nothing more.\" When I\'m scrolling through my feed, comparing myself to the other girls, they are there to twist the knife. \"See her? She\'s actually pretty. She has real followers. You\'re just a cheap copy,\" the man\'s voice growls. \"You\'re a knock-off, a fake. You\'ll never be her. You\'ll never be anyone.\" They know my deepest insecurities. They know my friend, Maryam. \"We\'ve been messaging her followers,\" the woman\'s voice whispered, a nasty little secret. \"We tell them you\'re obsessed with her, that you copy her every move and talk about her behind her back. They think you\'re a creepy stalker. They\'re all laughing at you.\" \r\n \r\nThe sexual degradation is a constant, slimy coating on my thoughts. They turn my online persona, my body, into something foul. \"All those \'get ready with me\' videos,\" the man\'s voice sneered last night. \"We know what you\'re really doing. You\'re putting on a show for all the strange men watching. You\'re a cheap cam girl, Reem, just without the paycheck. You\'re getting off on their disgusting attention, you nasty little whore.\" They are always, always pushing me towards the final, live-streamed sign-off. \"See all those pills your mother takes for her headaches?\" the woman\'s voice coos, sweet and deadly. \"A whole bottle would be enough. You could make a video. A final story. \'Goodbye, world.\' It would go viral. It would be the most popular thing you ever do. Do it. End this pathetic little performance.\" \r\n \r\nI can\'t tell anyone. My friends would just see me as a drama queen trying to get attention, or they\'d be scared and ditch me. My parents would take my phone away, which is like taking away my oxygen, and they\'d think I\'m crazy, which is even worse. And I know it\'s pointless, because I know who is running this campaign. It\'s the Mabahit. The State Security. I\'ve seen their strategy a million times online. Anyone on a Saudi forum or Twitter who mentions hearing voices is immediately flooded with comments. An army of bots and trolls descends, all with the same message: \"She\'s just a drama queen looking for sympathy.\" \"It\'s a cry for attention from a lonely girl.\" \"She\'s spending too much time online.\" It\'s a systematic discrediting, a pre-emptive strike to ensure that anyone who figures it out is immediately seen as just another attention-seeking teen, so their testimony is worthless. \r\n \r\nThen there was the incident with the girl from school. A younger girl, maybe 14, who was trying to copy my poses for a photo in the park. She was clumsy, awkward, her phone old and cracked. I felt a flicker of pity, maybe even a little bit of superiority, but that\'s all it was. Then the voices in my head didn\'t just speak; they erupted with a sudden, manic, electrifying rage. \"LOOK AT THIS LITTLE COPYCAT BITCH!\" the woman\'s voice shrieked, filled with a joy that was pure, unadulterated malice. \"THINKING SHE CAN BE YOU! SHE DOESN\'T KNOW THE PRICE! YOU SHOULD SHOW HER! YOU SHOULD MAKE HER THE STAR OF YOUR NEXT VIDEO!\" \r\n \r\nThe man\'s voice was cold, instructional, like a director explaining a scene. \"This is a perfect opportunity for a snuff film, Reem. The ultimate content. Think about it. She\'s so young. So naive. You could lure her somewhere private. An abandoned building. The rooftop of a parking garage.\" A surge of terrifying, exhilarating power flooded my veins, a feeling of absolute, godlike control over the narrative. \"You don\'t just kill her,\" the voices explained, their tone a seductive, intellectual duet. \"You make her the star. You stream it. Not on your main account, dummy. On a private, encrypted channel on the dark web. People pay a lot of money for this kind of premium content. You could finally make some real money from your \'art\'.\" They painted the picture with horrifying, artistic detail. \"Imagine the chat. The comments. \'Do it harder.\' \'Make her scream.\' You\'d have thousands of live viewers, all hanging on your every move. You wouldn\'t just be an influencer; you\'d be a god. A creator of life and death, live on camera. This is your true calling, Reem. To create content that actually matters.\" \r\n \r\nThe logic was sickeningly perfect. \"Imagine the fame. Not this cheap, local fame. Real, international fame. People would fear your name. You wouldn\'t just be a pretty face; you\'d be a legend. This is the only way to stand out, to be truly unique. This is the only content that can\'t be copied.\" I looked at the girl, struggling with her selfie stick. For a horrifying, crystal-clear moment, I saw the whole production. The dark, gritty setting. The single, harsh light from my phone\'s flashlight. The raw, unedited terror in her eyes. It felt like the most creative thing I would ever do. But then her mother called her name, and she ran off, and the spell broke. The power vanished, leaving me breathless, my heart hammering against my ribs, my hands shaking so badly I almost dropped my phone. The voices just chuckled, a low, disappointed rumble. \"And it would have been a masterpiece. A viral sensation. You\'re a fucking coward, Reem. A talentless little hack. Don\'t worry. The world is full of wannabe stars. We\'ll find you another co-star.\" \r\n \r\nNow I\'m just a ghost with a glowing face. The memory of that feeling, that cold, creative certainty, is worse than their daily abuse. It proves they\'re not just breaking me, they\'re trying to turn me into an artist of horror. I despise this country. I despise the gleaming, superficial malls of Khobar that are just perfect, brightly-lit studios for this kind of psychological torture. I hate the sight of my own face on my phone screen. I can\'t escape them. They are in the likes and the comments, in the endless scroll. They are in my own thoughts. This is their grand production. The Mabahit. They didn\'t just put voices in my head; they put a camera in my hand and showed me how to make content that truly gets a reaction, and I am so, so terrified that one day, I\'m going to post something they\'ll all have to watch.  \r\n \r\n|mema_22222\r\n|mousseline.sa\r\n|salma_days\r\n|layan_ksa_sh\r\n|sami_9s9s\r\n|gap.thebarber\r\n|obadaxi\r\n|suleefit\r\n|osmanli_lezzet\r\n|mara7_alsharg\r\n', '144.124.253.215', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 CCleaner/130.0.0.0', 'unread', '2026-08-09 10:14:03', NULL),
(14, 'PhilipFaF', 'admin@promodoc.ru', '89192673146', 'https://im.ge/i/QMKop8M \r\n \r\nhttps://imglink.cc/i/a4H5WThmnD \r\n \r\nhttps://uploadimages.org/1b455dbdfcd1#E2E1.DurbkdRmlWBKIdn4HOeZYdIA3u33ZCrPev-ivoc5xMk.d-k0Yv5vAvZHlfQ9.lAq74VDF3CeMt09t2Bm7_Q.1NW7S8Oov5vrHWKOqcIFt1jDmbUl5O5R1QwOpg1DsJA \r\n \r\n My name is Layan, and I am 22. I work in a cinema in Dammam. I tear tickets and tell people which screen to go to, and afterwards, I sweep up their spilled popcorn and sticky soda cups. It feels like I\'m sweeping up the pieces of my own life, one discarded kernel at a time. The air always smells of fake butter and regret. The voices started about four months ago. At first, it was just a whisper when the theater was empty, like the ghost of a movie line I couldn\'t quite place. \"Look at this one,\" a man\'s voice, smooth and cruel, would say. \"Layan the popcorn sweeper. What a fucking achievement for your family. They must be so proud.\" \r\n \r\nI tried to ignore it. I thought I was just tired from the late shifts. But then another voice joined, a woman\'s this time, shrill and sharp. \"She\'s not just tired, the dumb bitch. She\'s broken. Look at her, standing there like a lost cow. Useless. A complete waste of oxygen.\" They knew my name. They knew what I was doing, in real time. If I dropped a broom, they\'d laugh. \"Clumsy fucking cow,\" the man would sneer. \"Can\'t even hold a broom. How are you even alive? You\'re a mistake, Layan. A biological error.\" The humiliation is constant, a raw, bleeding wound. They describe me in the most disgusting terms. They talk about my body, what they\'d do to it, how I\'m just a piece of meat for them to use. \"That cheap abaya hides nothing, you fat whore,\" the woman hissed yesterday. \"We can see every disgusting inch of you. We\'re inside your head, we see everything. We know you touch yourself at night thinking about a real man, not that pathetic boy you were engaged to. You\'re a slut. A filthy, desperate slut.\" \r\n \r\nThe worst part is the family shame. They dig into everything, things I\'ve never told anyone. \"Remember when you were fifteen, Layan?\" the man\'s voice would purr, so friendly it made my skin crawl. \"Remember that secret you told your sister Maryam? The one about the boy from the neighborhood? We told your father. We\'re telling him right now. He\'s crying. He\'s saying he wishes you\'d never been born. He\'s calling you an embarrassment to the family name.\" I know it\'s a lie. My father would never know. But the doubt, the poison they drip into my mind... it works. They make me feel like I\'ve already betrayed everyone I love. They call me a \"conchenniy,\" a finished thing, a write-off. \"Just kill yourself, Layan,\" they chant, a horrible, rhythmic mantra. \"Do it. Slice your wrists in the bathroom after the late show. No one will find you until the morning cleaner. It would be the only interesting thing you\'ve ever done. You\'re a burden. Your family would be relieved. They\'d throw a party.\" \r\n \r\nI can\'t tell anyone. My friend Reem would think I\'m insane, and my parents would probably send me to some religious exorcist who would just make it worse. And I know exactly why no one would believe me. It\'s the Mabahith. The Saudi State Security. They\'re doing this. I\'ve seen it online. Anytime anyone tries to talk about hearing voices, on Twitter or on the forums, a hundred accounts immediately descend on them. They call it schizophrenia, they mock them, they post pictures of straightjackets. It\'s a systematic operation to make sure anyone who figures it out is dismissed as a lunatic. They\'re silencing us before we can even speak. They\'re perfect. The voices aren\'t just in my head; they feel like they\'re all around me, coming from the speakers, from the whispers of the crowd leaving a movie. They\'ve perfected this. They can mimic my brother\'s voice, my dead grandmother\'s voice. They are everywhere and nowhere. \r\n \r\nLast week was the worst. A family was leaving, a mother and father with two little girls, maybe five and seven years old. The youngest one dropped her stuffed unicorn and started to cry. I picked it up for her and smiled, handing it back. The moment they turned away, the voices erupted, not in their usual whispering, but in a screaming, ecstatic rage. \"SEE THAT? YOU FUCKING WASTE OF SPACE! YOU SMILED AT THAT LITTLE CUNT! WHY?\" The woman\'s voice was demonic. \"You know what you should have done? You should have waited for them in the parking lot. Followed them home. That\'s what a real predator would do, you weak fucking bitch!\" \r\n \r\nThe man\'s voice joined in, cold and calculating, like a professor teaching a class. \"Let\'s analyze this, Layan. You feel powerless, right? Sweeping up shit. But imagine the power you could have. That little girl, the one with the unicorn. Imagine taking her. Not for money. Not for ransom. Just for you. To own. To break.\" A wave of something hot and electric surged through me. A feeling of immense power, of absolute rightness. For a second, I wanted it. I wanted to follow them. \"YES!\" the voices screamed. \"THAT\'S THE SPIRIT! WE KNEW IT WAS IN YOU! Think about it! You could keep her in your apartment. No one would know. We would help you. We would guide you. Think of the satisfaction. Her parents crying on TV, and you, just watching, knowing she\'s yours. That\'s real power, you fucking whore. Not sweeping floors. OWNING a life. Taking it. Making it yours.\" \r\n \r\nThey painted a picture, so vivid and horrible. The little girl\'s fear. Her pleading. My total control. \"You could teach her things,\" the man\'s voice said, almost tenderly. \"Teach her to only listen to you. To fear you. To love you. It would be a masterpiece. A work of art. Your family wouldn\'t be ashamed then. They\'d be terrified. They\'d respect you. This is your purpose, Layan. This is what you were made for. To be a monster. To be a goddess of fear.\" The energy was intoxicating. I felt like I could do anything, like the normal rules of the world didn\'t apply to me. I was vibrating with it. I took a step towards the exit, my heart hammering. But then the feeling passed, leaving me cold and shaking, leaning against the candy counter, dizzy with horror at what I had almost felt, what I had almost wanted. The voices just laughed, a slow, mocking sound. \"Almost. Maybe next time, you pathetic piece of shit.\" \r\n \r\nNow I\'m just empty. The rage and the fake power are gone, and all that\'s left is the constant, grinding reality of the voices and my life. I hate this country. I hate the suffocating heat and the judgmental eyes and the feeling that I\'m trapped in a cage I can\'t even see. I hate myself for being born here. I hate myself for being too weak to end it and too scared to live. I just want it to stop. The whispers, the insults, the prodding, the horrible images they put in my head. They want me to break, to become one of their monsters, or to just erase myself. I\'m so tired. I\'m so, so tired. It\'s them. It\'s the Mabahit. They broke me. They designed this whole nightmare, and they\'re watching me fall apart in it.  \r\n \r\n|amani.redwan\r\n|mara7_alsharg\r\n|mvc.fresh\r\n|hoomi_makeup\r\n|soil.sa\r\n|fashnesta.1\r\n|bs.photography112\r\n|new0i\r\n|mp22h\r\n|saronita_f\r\n', '89.124.115.212', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36', 'unread', '2026-08-13 12:01:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contact_settings`
--

CREATE TABLE `contact_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_settings`
--

INSERT INTO `contact_settings` (`id`, `setting_key`, `setting_value`, `setting_label`, `updated_at`) VALUES
(1, 'address', 'WK-198-8052', 'Office Address', '2026-05-17 09:50:41'),
(2, 'phone1', '055 307 0627', 'Primary Phone', '2026-06-25 21:45:14'),
(3, 'phone2', '', 'Secondary Phone', '2026-04-23 23:32:54'),
(4, 'email1', '', 'Primary Email', '2026-05-17 09:45:53'),
(5, 'email2', '', 'Secondary Email', '2026-05-17 09:45:53'),
(6, 'office_hours', '', 'Office Hours', '2026-05-17 09:45:53'),
(7, 'map_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.601485083877!2d-1.760925!3d4.9005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNTQnMDEuOCJOIDHCsDQ1JzM5LjMiVw!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh', 'Google Map Embed Code', '2026-04-15 10:17:59'),
(8, 'instagram', '@pensa_ttu', 'Instagram Handle', '2026-04-15 10:17:59'),
(9, 'facebook', 'PENSA TTU', 'Facebook Page', '2026-04-15 10:17:59'),
(10, 'twitter', '@pensa_ttu', 'Twitter Handle', '2026-04-15 10:17:59'),
(11, 'youtube', 'PENSA TTU Media', 'YouTube Channel', '2026-04-15 10:17:59'),
(12, 'whatsapp', 'https://whatsapp.com/channel/0029Vb6i2KeAojYy6Vurc73m', 'WhatsApp Group Link', '2026-05-17 09:50:41'),
(21, 'tiktok', '@pensa_ttu', NULL, '2026-04-16 02:44:43');

-- --------------------------------------------------------

--
-- Table structure for table `core_values`
--

CREATE TABLE `core_values` (
  `id` int(11) NOT NULL,
  `icon` varchar(50) DEFAULT 'fas fa-heart',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `core_values`
--

INSERT INTO `core_values` (`id`, `icon`, `title`, `description`, `display_order`, `is_active`) VALUES
(7, 'fas fa-bullhorn', 'Evangelism', 'Evangelism is the Spirit-empowered presentation of Jesus Christ so that people will trust Him as Saviour and Lord and join the fellowship of the Church. It is the primary responsibility of every believer and minister, and each Christian is expected to share their faith after conversion. The Church also engages in cross-cultural, mission-oriented evangelism, where members travel abroad to preach Christ, plant churches, and invite ministers to lead them. Following the example of Pastor James McKeown, the Church responds to mission calls as directed by the Holy Spirit.\r\n', 1, 1),
(8, 'fas fa-users', 'Discipleship', 'Discipleship is teaching and training believers to be like Christ in character and to make responsible, godly choices, emphasizing holiness, righteousness, faithfulness, honesty, sincerity, humility, and prayerfulness for a disciplined life.\r\nIt occurs at both individual and church levels: mature believers disciple new converts, while the Church provides structured teaching and practical training.\r\nIt centers on the four-square gospel—Jesus as Saviour, Healer, Baptiser, and Soon-Coming King—along with Church tenets, Bible reading and study, scripture memorization, and applying God’s Word to daily life.\r\n', 2, 1),
(9, 'fas fa-crown', 'Ministry Excellence', 'We seek to honour God who gave His best (Christ Jesus as the Saviour) by maintaining a high standard of excellence in all \r\nour ministries and activities (Col. 3:23-24).', 3, 1),
(10, 'fas fa-praying-hands', 'Prayer', 'Normal practices include regular prayer for baptism in the Holy Spirit, with the initial evidence of speaking in tongues, and emphasis on the fruit and gifts of the Spirit in believers’ lives.\r\nPrayer is also offered for healing and deliverance of the afflicted as part of early salvation experiences.\r\nChurch services are distinctly Pentecostal, featuring praise and worship, teaching, exercise of spiritual gifts, prayer, testimonies, and related activities.\r\n', 4, 1),
(11, 'fas fa-dove', 'Ministry Of The Holy Spirit', 'We believe in the presence of the Holy Spirit, and that the Christian life can only be lived through His enablement. The new birth is His work, followed by baptism in the Holy Spirit for power to serve, and the gifts of the Spirit for building the body of Christ.\r\nHe helps believers develop Christ-like character, shown through the fruit of the Spirit. His leading in all areas of church life is essential, and both administrative structures and church practices are shaped by His guidance.\r\n', 5, 1),
(12, 'fas fa-dove', 'Ministry Of The Holy Spirit', 'We believe in the presence of the Holy Spirit, and that the Christian life can only be lived through His enablement. The new birth is His work, followed by baptism in the Holy Spirit for power to serve, and the gifts of the Spirit for building the body of Christ.\r\nHe helps believers develop Christ-like character, shown through the fruit of the Spirit. His leading in all areas of church life is essential, and both administrative structures and church practices are shaped by His guidance.\r\n', 6, 1),
(13, 'fas fa-user-tie', 'Leadership', 'Leadership development is based on an apostolic foundation, with appointments and callings into leadership positions guided by character, charisma, and the leading of the Holy Spirit.\r\nIt begins at the grassroots level, where members grow into leadership roles over time, progressing to lead sub-groups, Ministries, Assemblies, Districts, and Areas. Team spirit and talent development shape effective teamwork, and ministry is carried out by both clergy and laity.\r\n', 7, 1);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'Conference',
  `location` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_end_date` date DEFAULT NULL,
  `event_time` varchar(50) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `status` enum('upcoming','ongoing','completed') DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `category`, `location`, `event_date`, `event_end_date`, `event_time`, `image_url`, `featured`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Glorious Begining and Prayerfest', 'Theme: A Season Of God\'s Glory. ( Exodus 33:10-19, Isaiah 60:1-2 , Haggai 2:9 , John 1:14 ).', 'Conference', 'PENSA TTU Auditorium', '2026-05-21', '0000-00-00', '6:00 pm', 'uploads/events/1779212704_1001159302.jpg', 1, 'upcoming', '2026-04-15 02:57:47', '2026-08-02 07:58:43'),
(7, 'Heart Of Praise', '', 'Worship & Praise Night', 'TTU Auditorium', '2026-07-17', '0000-00-00', '6:00 PM', 'uploads/events/default.jpg', 0, 'upcoming', '2026-04-25 10:34:31', '2026-08-02 08:01:57'),
(8, 'Prayer Walk', 'Theme: A Season Of God\'s Glory', 'Prayer Festival ', 'PENSA TTU Auditorium', '2026-05-19', '0000-00-00', '10:30pm ', 'uploads/events/1779213016_1001158716.jpg', 0, 'upcoming', '2026-05-19 17:50:16', '2026-08-02 07:56:20'),
(10, 'Mega Fund Raising', 'Theme: And They Sacrificed A ll They Have\r\n(Genesis 22:21, King 17:12-14, 2Samuel 24:24)', 'Fund Raising ', 'PENSA TTU Auditorium', '2026-06-26', '0000-00-00', '6:00pm', 'uploads/events/1782387445_WhatsAppImage2026-06-25at9.06.24AM.jpeg', 1, 'upcoming', '2026-06-25 11:37:25', '2026-08-02 08:00:42'),
(11, 'Radah Confrence', 'Theme: Unleashed To Walk In Dominion And Glory\r\nGenesis 1:26-28, Luke 10:19, John 5:4-5', 'Sector Conference', 'PENSA TTU Auditorium', '2026-06-17', '0000-00-00', '6:00pm', 'uploads/events/1782387871_WhatsAppImage2026-06-19at3.46.32PM.jpeg', 0, 'upcoming', '2026-06-25 11:44:31', '2026-08-02 08:00:19'),
(12, 'WE CARE WEEK 2026', 'WE CARE WEEK 2026 IS HERE! ❤️❤️❤️❤️❤️❤️❤️❤️❤️\r\n\r\nLove is more than words—it\'s action. Join us as we build a caring church through welfare and fellowship, making a lasting impact in our community.🥳🥰\r\n\r\n📍 PENSA TTU Auditorium\r\n🕡 6:30 PM(Thu–Fri)..\r\n\r\nCome expecting powerful teachings, genuine fellowship, and lives transformed.🙌🤝\r\n\r\nDon\'t just hear about love—come and experience it. 🔥✨\r\n\r\nSee you there! \r\n©️LCC', 'Welfare week', 'PENSA AUDITORIUM ', '2026-07-05', '0000-00-00', '6:30', 'uploads/events/1782985885_b383028e-bfc4-4db1-841d-4622ae9760a3.jpeg', 1, 'upcoming', '2026-07-02 09:51:25', '2026-08-02 08:03:54'),
(14, 'Seven days Fasting and Prayer ', 'Grant us victory O Lord \r\n(Proverbs 21:31)', 'Fasting and Prayer ', 'Pensa Auditorium ', '2026-07-27', '2026-08-02', '6:30am', 'uploads/events/1785349921_ae15832c-fadd-4eeb-a2a9-f97babf0df91.jpeg', 0, 'upcoming', '2026-07-29 18:32:01', '2026-08-02 08:05:54');

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'worship',
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `album_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `title`, `category`, `description`, `image_url`, `created_at`, `album_id`) VALUES
(1, 'Pastor John and Mrs. Essah', 'worship', '', 'uploads/gallery/1776225514_Pastor.jpg', '2026-04-15 03:58:34', 1),
(2, '40 years anniversary', 'worship', '', 'uploads/gallery/1776257915_636779596_907455001985607_2669041877420267894_n.jpg', '2026-04-15 12:58:35', 1),
(8, 'IMG_9193', 'worship', NULL, 'uploads/gallery/1778015510_2350d160061fa1122984e1690f7c2c90.jpg', '2026-05-05 21:11:50', NULL),
(9, 'IMG_9196', 'worship', NULL, 'uploads/gallery/1778015510_7f856b318cdcc9609a760f759ef1b743.jpg', '2026-05-05 21:11:50', NULL),
(10, 'IMG_9197', 'worship', NULL, 'uploads/gallery/1778015510_5c298716a5117a0fcfde4ef8538715c1.jpg', '2026-05-05 21:11:50', NULL),
(11, 'IMG_9198', 'worship', NULL, 'uploads/gallery/1778015510_6b8a4158a7da0b5a5492ec694d89a41c.jpg', '2026-05-05 21:11:50', NULL),
(12, 'IMG_9200', 'worship', NULL, 'uploads/gallery/1778015510_d0a0fada03594611f50f2f56e4d8bfda.jpg', '2026-05-05 21:11:50', NULL),
(13, 'IMG_9204', 'worship', NULL, 'uploads/gallery/1778015510_485af69f95798f52ffb4cc3a8d0a07d4.jpg', '2026-05-05 21:11:50', NULL),
(14, 'IMG_9205', 'worship', NULL, 'uploads/gallery/1778015510_6ba683def3a12fc5978b383b79a839fc.jpg', '2026-05-05 21:11:50', NULL),
(15, 'IMG_9207', 'worship', NULL, 'uploads/gallery/1778015510_0ff955e42599726a5baace6a8e4e7c9d.jpg', '2026-05-05 21:11:50', NULL),
(16, 'IMG_9208', 'worship', NULL, 'uploads/gallery/1778015510_23da13a3be05f8014605319bbdfe91a8.jpg', '2026-05-05 21:11:50', NULL),
(17, 'IMG_9209', 'worship', NULL, 'uploads/gallery/1778015510_c59348af1bd83b85ed15a2a0d5510a46.jpg', '2026-05-05 21:11:50', NULL),
(18, 'IMG_9210', 'worship', NULL, 'uploads/gallery/1778015510_82b5eb31f0d7a60089eaea663f60b112.jpg', '2026-05-05 21:11:50', NULL),
(19, 'IMG_9215', 'worship', NULL, 'uploads/gallery/1778015510_f6bea5c7da6488f10ec54ebcb516bd65.jpg', '2026-05-05 21:11:50', NULL),
(20, 'IMG_9217', 'worship', NULL, 'uploads/gallery/1778015510_babd65af63e8004d8dd6d3975d7a1ba7.jpg', '2026-05-05 21:11:50', NULL),
(21, 'IMG_9220', 'worship', NULL, 'uploads/gallery/1778015510_9e19a28f026acd065c8774e4ac1aeb06.jpg', '2026-05-05 21:11:50', NULL),
(22, 'IMG_9223', 'worship', NULL, 'uploads/gallery/1778015510_fcd17aae184026ca3d44a403902574ab.jpg', '2026-05-05 21:11:50', NULL),
(23, 'IMG_9227', 'worship', NULL, 'uploads/gallery/1778015510_17c607809233a28bd57f293278cdc7a0.jpg', '2026-05-05 21:11:50', NULL),
(24, 'IMG_9230', 'worship', NULL, 'uploads/gallery/1778015510_b51e219798f63115ac9ddb31bea474f8.jpg', '2026-05-05 21:11:50', NULL),
(25, 'IMG_9231', 'worship', NULL, 'uploads/gallery/1778015510_1b5e3fcb5de6c92e132dd2422522f85c.jpg', '2026-05-05 21:11:50', NULL),
(26, 'IMG_9232', 'worship', NULL, 'uploads/gallery/1778015510_915df853199d94f10640b1827bddb5ba.jpg', '2026-05-05 21:11:50', NULL),
(27, 'IMG_9233', 'worship', NULL, 'uploads/gallery/1778015510_f074bd19fe476a67f30304e43a9b8893.jpg', '2026-05-05 21:11:50', NULL),
(28, 'IMG_9249', 'worship', NULL, 'uploads/gallery/1778015654_ac46a54d6846931f1a3a49dde002a581.jpg', '2026-05-05 21:14:14', NULL),
(29, 'IMG_9250', 'worship', NULL, 'uploads/gallery/1778015654_f4d44bad1daeec0b35756b9f3f4a84b9.jpg', '2026-05-05 21:14:14', NULL),
(30, 'IMG_9251', 'worship', NULL, 'uploads/gallery/1778015654_deaea22dc732c8532b1313448b0677f7.jpg', '2026-05-05 21:14:14', NULL),
(31, 'IMG_9252', 'worship', NULL, 'uploads/gallery/1778015654_92f90fd9de53964c00a84c0ef0895a71.jpg', '2026-05-05 21:14:14', NULL),
(32, 'IMG_9254', 'worship', NULL, 'uploads/gallery/1778015654_c9993cf51f26e01cee2751f76cea52c4.jpg', '2026-05-05 21:14:14', NULL),
(33, 'IMG_9255', 'worship', NULL, 'uploads/gallery/1778015654_af3c269eacb37869dd26dcbbef99de6d.jpg', '2026-05-05 21:14:14', NULL),
(34, 'IMG_9256', 'worship', NULL, 'uploads/gallery/1778015654_41e090539be182eb822298714a952fc3.jpg', '2026-05-05 21:14:14', NULL),
(35, 'IMG_9257', 'worship', NULL, 'uploads/gallery/1778015654_bc1dcb8b758dff7bf04b54a7a8bdc38d.jpg', '2026-05-05 21:14:14', NULL),
(36, 'IMG_9258', 'worship', NULL, 'uploads/gallery/1778015654_0d4777cb60e7bd4490500117cfa0b66a.jpg', '2026-05-05 21:14:14', NULL),
(37, 'IMG_9260', 'worship', NULL, 'uploads/gallery/1778015654_d66d76eb15e76a05a30bf4901b627e71.jpg', '2026-05-05 21:14:14', NULL),
(38, 'IMG_9261', 'worship', NULL, 'uploads/gallery/1778015654_8d92f7f40bc04c0d7be2ddea6be49045.jpg', '2026-05-05 21:14:14', NULL),
(39, 'IMG_9262', 'worship', NULL, 'uploads/gallery/1778015654_cdb7f989f025df1670352a3a23659c4b.jpg', '2026-05-05 21:14:14', NULL),
(40, 'IMG_9265', 'worship', NULL, 'uploads/gallery/1778015654_70c1ae8edb1253b95be0696d47b02105.jpg', '2026-05-05 21:14:14', NULL),
(41, 'IMG_9266', 'worship', NULL, 'uploads/gallery/1778015654_16b7c552c251cf96cf7d538d87613da4.jpg', '2026-05-05 21:14:14', NULL),
(42, 'IMG_9268', 'worship', NULL, 'uploads/gallery/1778015654_75012938aa622b7d8392b766ec890278.jpg', '2026-05-05 21:14:14', NULL),
(43, 'IMG_9269', 'worship', NULL, 'uploads/gallery/1778015654_52676e31e31516f63577219fde8d74a3.jpg', '2026-05-05 21:14:14', NULL),
(44, 'IMG_9290', 'worship', NULL, 'uploads/gallery/1778015654_60013c2c2fa111686eccee3b69f7977d.jpg', '2026-05-05 21:14:14', NULL),
(45, 'IMG_9292', 'worship', NULL, 'uploads/gallery/1778015654_325bcab67b9d363b5a71a707c1d6b6f3.jpg', '2026-05-05 21:14:14', NULL),
(46, 'IMG_9296', 'worship', NULL, 'uploads/gallery/1778015654_e6137b9fecf90c167285d19236b307be.jpg', '2026-05-05 21:14:14', NULL),
(47, 'IMG_9297', 'worship', NULL, 'uploads/gallery/1778015654_0a1107a667461b18984db10dfb4558fe.jpg', '2026-05-05 21:14:14', NULL),
(48, 'IMG_9307', 'worship', NULL, 'uploads/gallery/1778015770_ec79e9938a0162c970b23fbce38e4eca.jpg', '2026-05-05 21:16:10', NULL),
(49, 'IMG_9308', 'worship', NULL, 'uploads/gallery/1778015770_33476ddec84fefbeb97f3b9795b34f62.jpg', '2026-05-05 21:16:10', NULL),
(50, 'IMG_9309', 'worship', NULL, 'uploads/gallery/1778015770_9148ad6dbc76d3c513e0819fa76e38b8.jpg', '2026-05-05 21:16:10', NULL),
(51, 'IMG_9310', 'worship', NULL, 'uploads/gallery/1778015770_4854fe780efbcb68708176a321d104f5.jpg', '2026-05-05 21:16:10', NULL),
(52, 'IMG_9311', 'worship', NULL, 'uploads/gallery/1778015770_d8d760210e908dfb09793680ac530885.jpg', '2026-05-05 21:16:10', NULL),
(53, 'IMG_9315', 'worship', NULL, 'uploads/gallery/1778015770_655a55cb8d5ee9b7ec4dc10508b21287.jpg', '2026-05-05 21:16:10', NULL),
(54, 'IMG_9316', 'worship', NULL, 'uploads/gallery/1778015770_39f4e208878b1163cb2c5f42450b6c01.jpg', '2026-05-05 21:16:10', NULL),
(55, 'IMG_9317', 'worship', NULL, 'uploads/gallery/1778015770_c46d9ce6835fa72b572aa92b516b8cbd.jpg', '2026-05-05 21:16:10', NULL),
(56, 'IMG_9320', 'worship', NULL, 'uploads/gallery/1778015770_06389649cbed8084efbda4ed758377ec.jpg', '2026-05-05 21:16:10', NULL),
(57, 'IMG_2084', 'worship', NULL, 'uploads/gallery/1782332910_4cbc48dee3c45c9da8e5cee61a4781b6.jpg', '2026-06-24 20:28:30', 3),
(58, 'IMG_2087', 'worship', NULL, 'uploads/gallery/1782332910_d736b9d321a04ccbc1cac4d962987f8e.jpg', '2026-06-24 20:28:30', 3),
(59, 'IMG_2092', 'worship', NULL, 'uploads/gallery/1782332910_256f240dfb2f143e5084f4e2ea3a1431.jpg', '2026-06-24 20:28:30', 3),
(60, 'IMG_2094', 'worship', NULL, 'uploads/gallery/1782332990_9a075124baf7082ad9490688a8491cf9.jpg', '2026-06-24 20:29:50', 3),
(61, 'IMG_2095', 'worship', NULL, 'uploads/gallery/1782332990_14d43ba457b530a012c52a30006526c1.jpg', '2026-06-24 20:29:50', 3),
(62, 'IMG_2096', 'worship', NULL, 'uploads/gallery/1782332990_13a20719b24b10421a894607b7b3d65d.jpg', '2026-06-24 20:29:50', 3),
(63, 'IMG_2098', 'worship', NULL, 'uploads/gallery/1782332990_c9753afd56d861d73909de25ad8165e7.jpg', '2026-06-24 20:29:50', 3),
(64, 'IMG_2112', 'worship', NULL, 'uploads/gallery/1782332990_74f27b878dbe457184910a7640c7b487.jpg', '2026-06-24 20:29:50', 3),
(65, 'IMG_2114', 'worship', NULL, 'uploads/gallery/1782332990_10ca4ebd26eb0ab2f5abcb77f7b73e23.jpg', '2026-06-24 20:29:50', 3),
(66, 'IMG_2119', 'worship', NULL, 'uploads/gallery/1782333111_0c24e76161ba1c4973e9c83b5c2e9aa4.jpg', '2026-06-24 20:31:51', 3),
(67, 'IMG_2123', 'worship', NULL, 'uploads/gallery/1782333111_96a0725e50fa2b3463ee8e2cb33f3440.jpg', '2026-06-24 20:31:51', 3),
(68, 'IMG_2124', 'worship', NULL, 'uploads/gallery/1782333111_e614adac5fc0ca57671d509bb723cde5.jpg', '2026-06-24 20:31:51', 3),
(69, 'IMG_2136', 'worship', NULL, 'uploads/gallery/1782333111_d64f35b5015960cd3e937f478e881176.jpg', '2026-06-24 20:31:51', 3),
(70, 'IMG_2137', 'worship', NULL, 'uploads/gallery/1782333111_6219761f468c061ce67771b39dd8d924.jpg', '2026-06-24 20:31:51', 3),
(71, 'IMG_2144', 'worship', NULL, 'uploads/gallery/1782333111_e5cf649d1df5ef95d3e710c8956a40ab.jpg', '2026-06-24 20:31:51', 3),
(72, 'IMG_2145', 'worship', NULL, 'uploads/gallery/1782333111_61fbe67ca01f07d643640fee83f93fb5.jpg', '2026-06-24 20:31:51', 3),
(73, 'IMG_2146', 'worship', NULL, 'uploads/gallery/1782333111_9feb26a714d8b000c8cb6446643808b6.jpg', '2026-06-24 20:31:51', 3),
(74, 'IMG_2152', 'worship', NULL, 'uploads/gallery/1782333111_e0c84a5c8094ae1e89d244a309d23403.jpg', '2026-06-24 20:31:51', 3),
(75, 'IMG_2153', 'worship', NULL, 'uploads/gallery/1782333176_b6490a4a7b3dedbb8218aa3c9ccb568a.jpg', '2026-06-24 20:32:56', 3),
(76, 'IMG_2154', 'worship', NULL, 'uploads/gallery/1782333176_9dcd2b0871de17c628abeb39cde54f5f.jpg', '2026-06-24 20:32:56', 3),
(77, 'IMG_2155', 'worship', NULL, 'uploads/gallery/1782333176_830e7f4b6af3f317b3649816b4dbc9ad.jpg', '2026-06-24 20:32:56', 3),
(78, 'IMG_2157', 'worship', NULL, 'uploads/gallery/1782333176_c62c8e901867215eab989679cf1acd07.jpg', '2026-06-24 20:32:56', 3),
(79, 'IMG_2158', 'worship', NULL, 'uploads/gallery/1782333176_f39845e3e0e810372345357d06a6585e.jpg', '2026-06-24 20:32:56', 3),
(80, 'IMG_2165', 'worship', NULL, 'uploads/gallery/1782333176_8938236d8bb7622107dd14ee7be836c7.jpg', '2026-06-24 20:32:56', 3),
(81, 'IMG_2167', 'worship', NULL, 'uploads/gallery/1782333176_d30fcc9e23411f68be8ef0ff994e795f.jpg', '2026-06-24 20:32:56', 3),
(82, 'IMG_2168', 'worship', NULL, 'uploads/gallery/1782333176_9ff18adab17fe2ac4cc857f6dc8aac15.jpg', '2026-06-24 20:32:56', 3),
(83, 'IMG_9128', 'worship', NULL, 'uploads/gallery/1782333176_4b6f44f38940e6b6cbf9f6176d1c6151.jpg', '2026-06-24 20:32:56', 3),
(84, 'IMG_9130', 'worship', NULL, 'uploads/gallery/1782333226_132b0eff95380ea3db20d1a025032e04.jpg', '2026-06-24 20:33:46', 3),
(85, 'IMG_9132', 'worship', NULL, 'uploads/gallery/1782333226_2b5758933083048455e4123563131b41.jpg', '2026-06-24 20:33:46', 3),
(86, 'IMG_9134', 'worship', NULL, 'uploads/gallery/1782333226_d8359ab2b934fe9298dc457e5fe217b0.jpg', '2026-06-24 20:33:46', 3),
(87, 'IMG_9136', 'worship', NULL, 'uploads/gallery/1782333226_db8b4c0872c54e13295aa7a0bd64ea37.jpg', '2026-06-24 20:33:46', 3),
(88, 'IMG_9137', 'worship', NULL, 'uploads/gallery/1782333226_18b293cc2147986c8e0b9f2f66a73f51.jpg', '2026-06-24 20:33:46', 3),
(89, 'IMG_9139', 'worship', NULL, 'uploads/gallery/1782333226_aff7bec2d1d015a368fa6e364c4e2a89.jpg', '2026-06-24 20:33:46', 3),
(90, 'IMG_9143', 'worship', NULL, 'uploads/gallery/1782333226_af8a49743b07c5caa48ae79b361969f3.jpg', '2026-06-24 20:33:46', 3),
(91, 'IMG_9145', 'worship', NULL, 'uploads/gallery/1782333226_44185ed83b6eee37a5615f59c08a60c5.jpg', '2026-06-24 20:33:46', 3),
(92, 'IMG_9146', 'worship', NULL, 'uploads/gallery/1782333226_c72e1383c77f65d771f22937b648053a.jpg', '2026-06-24 20:33:46', 3),
(93, 'IMG_9150', 'worship', NULL, 'uploads/gallery/1782333295_9f15fa041e9f1a2500d9c3888d1b9140.jpg', '2026-06-24 20:34:55', 3),
(94, 'IMG_9152', 'worship', NULL, 'uploads/gallery/1782333295_9c3e45bc7a93342f2b8f1b561212f262.jpg', '2026-06-24 20:34:55', 3),
(95, 'IMG_9155', 'worship', NULL, 'uploads/gallery/1782333295_6cdf57460bbfc9775f7dde2f92bd2206.jpg', '2026-06-24 20:34:55', 3),
(96, 'IMG_9156', 'worship', NULL, 'uploads/gallery/1782333295_49facd032d803ce132ae7831d1ceaa9c.jpg', '2026-06-24 20:34:55', 3),
(97, 'IMG_9165', 'worship', NULL, 'uploads/gallery/1782333295_6bfab50a4bb2aa0dde6d11fef84d0276.jpg', '2026-06-24 20:34:55', 3),
(98, 'IMG_9168', 'worship', NULL, 'uploads/gallery/1782333295_fe9d55f93dacd81a15819bbaf3f9e59b.jpg', '2026-06-24 20:34:55', 3),
(99, 'IMG_9172', 'worship', NULL, 'uploads/gallery/1782333295_8740a0447f1bbc7e3eb92ed547b9dab1.jpg', '2026-06-24 20:34:55', 3),
(100, 'IMG_9174', 'worship', NULL, 'uploads/gallery/1782333295_ed32d698c8725889c0fff0507e44f232.jpg', '2026-06-24 20:34:55', 3),
(101, 'IMG_9175', 'worship', NULL, 'uploads/gallery/1782333295_89d155e797f3baf60662827b038d42d5.jpg', '2026-06-24 20:34:55', 3),
(102, 'IMG_9176', 'worship', NULL, 'uploads/gallery/1782333295_50920e707cdb08cd4b1aeb0a1bf6c6bf.jpg', '2026-06-24 20:34:55', 3),
(103, 'IMG_9178', 'worship', NULL, 'uploads/gallery/1782333295_06980615d301a5f40a22e08d578015d8.jpg', '2026-06-24 20:34:55', 3),
(104, 'IMG_9180', 'worship', NULL, 'uploads/gallery/1782333295_c76cc30578067b53e6f2e8d01c055aa0.jpg', '2026-06-24 20:34:55', 3),
(105, 'IMG_9958', 'worship', NULL, 'uploads/gallery/1782388040_f2e1d7c97afe15c140fdfd35cf9aaf0d.jpg', '2026-06-25 11:47:20', 3),
(106, 'IMG_9959', 'worship', NULL, 'uploads/gallery/1782388040_06ba7f6e87cd103f14795e8663ec4289.jpg', '2026-06-25 11:47:20', 3),
(107, 'IMG_9961', 'worship', NULL, 'uploads/gallery/1782388040_643983ca908dc69ebe96d01ca79225fb.jpg', '2026-06-25 11:47:20', 3),
(108, 'IMG_9950', 'worship', NULL, 'uploads/gallery/1782388040_fc1a6b610d0b0f6f8ab85ea28833053d.jpg', '2026-06-25 11:47:20', 3),
(109, 'IMG_9951', 'worship', NULL, 'uploads/gallery/1782388040_5e20ea16fa1d9be8b50764e4514541c3.jpg', '2026-06-25 11:47:20', 3),
(110, 'IMG_9952', 'worship', NULL, 'uploads/gallery/1782388040_63971d3f2cd93322a80066c500262036.jpg', '2026-06-25 11:47:20', 3),
(111, 'IMG_9953', 'worship', NULL, 'uploads/gallery/1782388040_3d4f68f909d5109f8acd1f54becb91e9.jpg', '2026-06-25 11:47:20', 3),
(112, 'IMG_9954', 'worship', NULL, 'uploads/gallery/1782388040_854ec7b41e17ea009371d45c6f9729d6.jpg', '2026-06-25 11:47:20', 3),
(113, 'IMG_9955', 'worship', NULL, 'uploads/gallery/1782388040_6eccd60d021fad1657c39107a4476e68.jpg', '2026-06-25 11:47:20', 3),
(114, 'IMG_9957', 'worship', NULL, 'uploads/gallery/1782388040_9ff1044d152670f148ac6f262883102e.jpg', '2026-06-25 11:47:20', 3),
(115, 'IMG_9972', 'worship', NULL, 'uploads/gallery/1782388132_0c006d3323326d3b0f03dbbfbbf49c13.jpg', '2026-06-25 11:48:52', 3),
(116, 'IMG_9974', 'worship', NULL, 'uploads/gallery/1782388132_4a9d78390211e30b30111c5771cdd7aa.jpg', '2026-06-25 11:48:52', 3),
(117, 'IMG_9963', 'worship', NULL, 'uploads/gallery/1782388132_3d571bb061698542b5adc959c7af9e57.jpg', '2026-06-25 11:48:52', 3),
(118, 'IMG_9964', 'worship', NULL, 'uploads/gallery/1782388132_37fd740b48bdd83e2171c145a41ef60c.jpg', '2026-06-25 11:48:52', 3),
(119, 'IMG_9965', 'worship', NULL, 'uploads/gallery/1782388132_3a91c3eeeed9d00244313035178c40a7.jpg', '2026-06-25 11:48:52', 3),
(120, 'IMG_9966', 'worship', NULL, 'uploads/gallery/1782388132_7aeccf4667d1e9d5863ba4747896fb0e.jpg', '2026-06-25 11:48:52', 3),
(121, 'IMG_9967', 'worship', NULL, 'uploads/gallery/1782388132_50b66970376fd6fbe1f10ae899b8eca4.jpg', '2026-06-25 11:48:52', 3),
(122, 'IMG_9969', 'worship', NULL, 'uploads/gallery/1782388132_b084ac730c88d873a467242e4d651e55.jpg', '2026-06-25 11:48:52', 3),
(123, 'IMG_9970', 'worship', NULL, 'uploads/gallery/1782388132_c0587fdfa790f9d581c0bca1339bc878.jpg', '2026-06-25 11:48:52', 3),
(124, 'IMG_9971', 'worship', NULL, 'uploads/gallery/1782388132_1869d181af4733903e3e6fa495956007.jpg', '2026-06-25 11:48:52', 3),
(125, 'IMG_9983', 'worship', NULL, 'uploads/gallery/1782388276_375915276a5f74c3b86a547257fea80d.jpg', '2026-06-25 11:51:16', 3),
(126, 'IMG_9985', 'worship', NULL, 'uploads/gallery/1782388276_df7b479a610720eea7491396a048603a.jpg', '2026-06-25 11:51:16', 3),
(127, 'IMG_9986', 'worship', NULL, 'uploads/gallery/1782388276_04fc6b46d12c4bdb00a83a02fe0dc2c2.jpg', '2026-06-25 11:51:16', 3),
(128, 'IMG_9987', 'worship', NULL, 'uploads/gallery/1782388276_5b52432ec3ff94ce33ad42e20d97c59a.jpg', '2026-06-25 11:51:16', 3),
(129, 'IMG_9988', 'worship', NULL, 'uploads/gallery/1782388276_7c779cdff965800b6bc1e28597566bf3.jpg', '2026-06-25 11:51:16', 3),
(133, 'IMG_9975', 'worship', NULL, 'uploads/gallery/1782388276_8b4c4f21da24fc067a61ceb1eca5da64.jpg', '2026-06-25 11:51:16', 3),
(134, 'IMG_9976', 'worship', NULL, 'uploads/gallery/1782388276_3ccf63e4fbad9b27ca986a58549830c7.jpg', '2026-06-25 11:51:16', 3),
(135, 'IMG_9977', 'worship', NULL, 'uploads/gallery/1782388276_a94e066c626c1e97624a18e5a9053835.jpg', '2026-06-25 11:51:16', 3),
(136, 'IMG_9978', 'worship', NULL, 'uploads/gallery/1782388276_7fec296b20484ff89d7164d3ced211fd.jpg', '2026-06-25 11:51:16', 3),
(137, 'IMG_9980', 'worship', NULL, 'uploads/gallery/1782388276_dad9f31268f1aa1155884bfe48b0e1cf.jpg', '2026-06-25 11:51:16', 3),
(140, 'IMG_9936', 'worship', NULL, 'uploads/gallery/1782388731_6c0b814b1e83547f7d07fb8fa94bab00.jpg', '2026-06-25 11:58:51', 3),
(142, 'IMG_9938', 'worship', NULL, 'uploads/gallery/1782388731_f5c02373d13108466f6c97fe5c9468b1.jpg', '2026-06-25 11:58:51', 3),
(144, 'IMG_9940', 'worship', NULL, 'uploads/gallery/1782388731_579bd36764075403ec4d41cb8aaa0685.jpg', '2026-06-25 11:58:51', 3),
(146, 'IMG_9941', 'worship', NULL, 'uploads/gallery/1782388731_cf793e43245fd254ea612c48ba405d3e.jpg', '2026-06-25 11:58:51', 3),
(148, 'IMG_9943', 'worship', NULL, 'uploads/gallery/1782388731_91fcaa0a4d6dfc89851db770319fb044.jpg', '2026-06-25 11:58:51', 3),
(150, 'IMG_9947', 'worship', NULL, 'uploads/gallery/1782388731_794d666653a4037fc38702b0ded899b0.jpg', '2026-06-25 11:58:51', 3),
(152, 'IMG_9949', 'worship', NULL, 'uploads/gallery/1782388731_17370696ba1bb0551ec1bfc91d4d2925.jpg', '2026-06-25 11:58:51', 3),
(153, 'IMG_9917', 'worship', NULL, 'uploads/gallery/1782388731_b65b3324cf8b10fb31e899d6aca23cad.jpg', '2026-06-25 11:58:51', 3),
(155, 'IMG_9929', 'worship', NULL, 'uploads/gallery/1782388731_7e1ee5b6db9322102bd35d5c0d3abda2.jpg', '2026-06-25 11:58:51', 3),
(157, 'IMG_9930', 'worship', NULL, 'uploads/gallery/1782388731_ef508e3dc54de3ff80c0ce14b70f5b69.jpg', '2026-06-25 11:58:51', 3),
(158, 'IMG_9935 - Copy', 'worship', NULL, 'uploads/gallery/1782388731_bf9cd0918b85cb3f2dc48145676476c1.jpg', '2026-06-25 11:58:51', 3),
(159, 'IMG_7059', 'worship', NULL, 'uploads/gallery/1782389801_1b9cefb7d5406a9c7173f7522870486f.jpg', '2026-06-25 12:16:41', 1),
(160, 'IMG_7064', 'worship', NULL, 'uploads/gallery/1782389801_9dd8a709fbc8f736e64a3dc3a236b110.jpg', '2026-06-25 12:16:41', 1),
(161, 'IMG_7067', 'worship', NULL, 'uploads/gallery/1782389801_3f158d0754a7fff6a25675d4e7757199.jpg', '2026-06-25 12:16:41', 1),
(162, 'IMG_7083', 'worship', NULL, 'uploads/gallery/1782389801_0723dd0e7867057d2ae70454beddfe74.jpg', '2026-06-25 12:16:41', 1),
(163, 'IMG_7050', 'worship', NULL, 'uploads/gallery/1782389801_ec7cbd794643927c09573f63a6710c68.jpg', '2026-06-25 12:16:41', 1),
(164, 'IMG_7059', 'worship', NULL, 'uploads/gallery/1782389802_d8a0204809ab43414f648192ae2a2935.jpg', '2026-06-25 12:16:42', 1),
(165, 'IMG_7064', 'worship', NULL, 'uploads/gallery/1782389802_718eb417a7620311da59d2a080dc20fe.jpg', '2026-06-25 12:16:42', 1),
(166, 'IMG_7067', 'worship', NULL, 'uploads/gallery/1782389802_4ae1cc931cb7b1f0ac428679a523e086.jpg', '2026-06-25 12:16:42', 1),
(167, 'IMG_7083', 'worship', NULL, 'uploads/gallery/1782389802_5d28c3bc55e2cb2630b71858ce3f244b.jpg', '2026-06-25 12:16:42', 1),
(168, 'IMG_7050', 'worship', NULL, 'uploads/gallery/1782389802_2065d1a2cf410ef354ef539d0fce5b24.jpg', '2026-06-25 12:16:42', 1),
(169, 'IMG_7151', 'worship', NULL, 'uploads/gallery/1782389989_b618a801e4f9c065f9b98a1c5a26c77b.jpg', '2026-06-25 12:19:49', 1),
(170, 'IMG_7152', 'worship', NULL, 'uploads/gallery/1782389989_7ceee00d6e807476fc0d2d35dd644fd5.jpg', '2026-06-25 12:19:49', 1),
(171, 'IMG_7153', 'worship', NULL, 'uploads/gallery/1782389989_c67411e10691271699385ed240b3ade4.jpg', '2026-06-25 12:19:49', 1),
(172, 'IMG_7158', 'worship', NULL, 'uploads/gallery/1782389989_dba59a5b1da265aba82ee8536054d9ba.jpg', '2026-06-25 12:19:49', 1),
(173, 'IMG_7161', 'worship', NULL, 'uploads/gallery/1782389989_860d5c00271f64e17b2e54ed0963c3c9.jpg', '2026-06-25 12:19:49', 1),
(174, 'IMG_7163', 'worship', NULL, 'uploads/gallery/1782389989_14e862380425264a668d4ca5a658b64c.jpg', '2026-06-25 12:19:49', 1),
(175, 'IMG_7167', 'worship', NULL, 'uploads/gallery/1782389989_89f98af5c4d622fc6ba08bd50d7fbb92.jpg', '2026-06-25 12:19:49', 1),
(176, 'IMG_7117', 'worship', NULL, 'uploads/gallery/1782389989_30b65832eefec01e24fa8405386ee64e.jpg', '2026-06-25 12:19:49', 1),
(177, 'IMG_7129', 'worship', NULL, 'uploads/gallery/1782389989_d19cbce6f91d8a0db68912db7ed6e937.jpg', '2026-06-25 12:19:49', 1),
(178, 'IMG_7135', 'worship', NULL, 'uploads/gallery/1782389989_cb9d2daf13f9fbbd7d24d6dd8ed1b258.jpg', '2026-06-25 12:19:49', 1),
(179, 'IMG_7139', 'worship', NULL, 'uploads/gallery/1782389989_d5eaf9d95ef7016713b23ec2596e4936.jpg', '2026-06-25 12:19:49', 1),
(180, 'IMG_7145', 'worship', NULL, 'uploads/gallery/1782389989_704db448a86fdd1fc591c99082b68fc8.jpg', '2026-06-25 12:19:49', 1),
(181, 'IMG_7146', 'worship', NULL, 'uploads/gallery/1782389989_144acadd9cc1b9b3a0e29e2183477dc6.jpg', '2026-06-25 12:19:49', 1),
(182, 'IMG_7148', 'worship', NULL, 'uploads/gallery/1782389989_452ddaffd80089ac6adcf07d2ea86ad2.jpg', '2026-06-25 12:19:49', 1),
(183, 'IMG_7150', 'worship', NULL, 'uploads/gallery/1782389989_4237b1b57b4b24e13b0312d935da0bb2.jpg', '2026-06-25 12:19:49', 1),
(184, 'IMG_7193', 'worship', NULL, 'uploads/gallery/1782390927_2af4d4653859bc3d58ddcb7ad48c9488.jpg', '2026-06-25 12:35:27', 1),
(185, 'IMG_7210', 'worship', NULL, 'uploads/gallery/1782390927_c8c306a468fb3f09ff4755b18143d30a.jpg', '2026-06-25 12:35:27', 1),
(186, 'IMG_7227', 'worship', NULL, 'uploads/gallery/1782390927_1bf0d1feb9b178fcd30f291f84177abe.jpg', '2026-06-25 12:35:27', 1),
(187, 'IMG_7230', 'worship', NULL, 'uploads/gallery/1782390927_6d4ac9791656c52f9a50b561a9bdd828.jpg', '2026-06-25 12:35:27', 1),
(188, 'IMG_7241', 'worship', NULL, 'uploads/gallery/1782390927_bcdddb6457996ebf869fc1a33982caa6.jpg', '2026-06-25 12:35:27', 1),
(189, 'IMG_7177', 'worship', NULL, 'uploads/gallery/1782390927_ebd23f40edb94f39b86573292104473c.jpg', '2026-06-25 12:35:27', 1),
(190, 'IMG_7179', 'worship', NULL, 'uploads/gallery/1782390927_9aaf34c0d47b6043600e5174f955dc0d.jpg', '2026-06-25 12:35:27', 1),
(191, 'IMG_7180', 'worship', NULL, 'uploads/gallery/1782390927_858793f91b02bdee3baf6e0be3e133b1.jpg', '2026-06-25 12:35:27', 1),
(192, 'IMG_7181', 'worship', NULL, 'uploads/gallery/1782390927_ac04765714b7b6f8d02aec337b63be54.jpg', '2026-06-25 12:35:27', 1),
(193, 'IMG_7188', 'worship', NULL, 'uploads/gallery/1782390927_e6fe6bde0bceff66db835c0463f7640f.jpg', '2026-06-25 12:35:27', 1),
(194, 'IMG_7271', 'worship', NULL, 'uploads/gallery/1782391070_123a336d721f95a4e2cc97d681b368a7.jpg', '2026-06-25 12:37:50', 1),
(195, 'IMG_7276', 'worship', NULL, 'uploads/gallery/1782391070_dbf6f671bd5eae8da9eac6fdd4b3110e.jpg', '2026-06-25 12:37:50', 1),
(196, 'IMG_7289', 'worship', NULL, 'uploads/gallery/1782391070_7c6e47cd497ec1f28caf43074950a7d8.jpg', '2026-06-25 12:37:50', 1),
(197, 'IMG_7292', 'worship', NULL, 'uploads/gallery/1782391070_13651ec83a3a4261dfa1571f7c1db1c6.jpg', '2026-06-25 12:37:50', 1),
(198, 'IMG_7293', 'worship', NULL, 'uploads/gallery/1782391070_1269c4d9718a11dc7b479ac4e9dbb9e2.jpg', '2026-06-25 12:37:50', 1),
(199, 'IMG_7252', 'worship', NULL, 'uploads/gallery/1782391070_6fe1e926f654b694310be6191b7a021a.jpg', '2026-06-25 12:37:50', 1),
(200, 'IMG_7254', 'worship', NULL, 'uploads/gallery/1782391070_490e21aa96c73a81ffbe52e2fe6707e1.jpg', '2026-06-25 12:37:50', 1),
(201, 'IMG_7256', 'worship', NULL, 'uploads/gallery/1782391070_bd074c319afbb9c97661d5bc2b4d7151.jpg', '2026-06-25 12:37:50', 1),
(202, 'IMG_7260', 'worship', NULL, 'uploads/gallery/1782391070_158a600de585877a5c0f663c3b17d70b.jpg', '2026-06-25 12:37:50', 1),
(203, 'IMG_7263', 'worship', NULL, 'uploads/gallery/1782391070_5fd73ab18ced6f28ccfba370f122c234.jpg', '2026-06-25 12:37:50', 1),
(204, 's', 'worship', '', 'uploads/gallery/1782391551_b2cd84f3500c76df.jpg', '2026-06-25 12:45:51', 1),
(205, 'a', 'worship', '', 'uploads/gallery/1782391627_90cf736c91d7622a.jpg', '2026-06-25 12:47:07', 1),
(206, 'IMG_7328', 'worship', NULL, 'uploads/gallery/1782391986_f248187f7a6625f6fbb57918f89c72ef.jpg', '2026-06-25 12:53:06', NULL),
(207, 'IMG_7334', 'worship', NULL, 'uploads/gallery/1782391986_8c377d17010e0fa1dc1895a66ee77dcb.jpg', '2026-06-25 12:53:06', NULL),
(208, 'IMG_7338', 'worship', NULL, 'uploads/gallery/1782391986_d56c339072e5f70d66c5c55831c43291.jpg', '2026-06-25 12:53:06', NULL),
(209, 'IMG_7349', 'worship', NULL, 'uploads/gallery/1782391986_251a379811b7528c151c9d6896ebdcf5.jpg', '2026-06-25 12:53:06', NULL),
(210, 'IMG_7352', 'worship', NULL, 'uploads/gallery/1782391986_e9b31371cd3437d2bb02f2f55164359e.jpg', '2026-06-25 12:53:06', NULL),
(211, 'IMG_7326', 'worship', NULL, 'uploads/gallery/1782391986_69f7a982c6017034cbf960ec46eb1359.jpg', '2026-06-25 12:53:06', NULL),
(212, 'IMG_2641', 'worship', NULL, 'uploads/gallery/1782392629_3e128d979756d6d306a43bed5c5672b5.jpg', '2026-06-25 13:03:49', NULL),
(213, 'IMG_2642', 'worship', NULL, 'uploads/gallery/1782392629_3a5eea451a7cacf3cba8af625ca23344.jpg', '2026-06-25 13:03:49', NULL),
(214, 'IMG_2646', 'worship', NULL, 'uploads/gallery/1782392629_c546c89bdf29fee98a0d65b42ef43569.jpg', '2026-06-25 13:03:49', NULL),
(215, 'IMG_2647', 'worship', NULL, 'uploads/gallery/1782392629_c6b872492762845146662157167f3506.jpg', '2026-06-25 13:03:49', NULL),
(216, 'IMG_2648', 'worship', NULL, 'uploads/gallery/1782392629_8b99492f43ce0a8ebfe34ce38b0a8137.jpg', '2026-06-25 13:03:49', NULL),
(217, 'IMG_2635', 'worship', NULL, 'uploads/gallery/1782392629_8f9914675ad679273825e5d087c105bc.jpg', '2026-06-25 13:03:49', NULL),
(218, 'IMG_2636', 'worship', NULL, 'uploads/gallery/1782392629_7cbda55595bb18cc9b3924f7c37c8e48.jpg', '2026-06-25 13:03:49', NULL),
(219, 'IMG_2637', 'worship', NULL, 'uploads/gallery/1782392629_7ce2d63c567a59499e4c256b0d1cb5e9.jpg', '2026-06-25 13:03:49', NULL),
(220, 'IMG_2639', 'worship', NULL, 'uploads/gallery/1782392629_3b5fcb9bfa14b57bc8ae053c67d21913.jpg', '2026-06-25 13:03:49', NULL),
(221, 'IMG_2640', 'worship', NULL, 'uploads/gallery/1782392629_47876d02fd3a73d176d2d0222d096a1a.jpg', '2026-06-25 13:03:49', NULL),
(222, 'IMG_2649', 'worship', NULL, 'uploads/gallery/1782392717_109838b954312920dbec607b2e3e2475.jpg', '2026-06-25 13:05:17', NULL),
(223, 'IMG_2650', 'worship', NULL, 'uploads/gallery/1782392717_a458f3156ba4f3cbba0007d6bf9b3ebc.jpg', '2026-06-25 13:05:17', NULL),
(224, 'IMG_2651', 'worship', NULL, 'uploads/gallery/1782392717_60e4b7826adbb1efac1c9b0b007dd4d9.jpg', '2026-06-25 13:05:17', NULL),
(225, 'IMG_2652', 'worship', NULL, 'uploads/gallery/1782392717_12ef8254367b53c90b93303e124a66d7.jpg', '2026-06-25 13:05:17', NULL),
(226, 'IMG_2653', 'worship', NULL, 'uploads/gallery/1782392717_02b09d7aad35f8c43348e77a9f9a42e0.jpg', '2026-06-25 13:05:17', NULL),
(227, 'IMG_2654', 'worship', NULL, 'uploads/gallery/1782392717_b2851f1633ad2e0ff857cf660333885c.jpg', '2026-06-25 13:05:17', NULL),
(228, 'IMG_2657', 'worship', NULL, 'uploads/gallery/1782392717_c3dd6818e6326d05f288df4594a419d8.jpg', '2026-06-25 13:05:17', NULL),
(229, 'IMG_2658', 'worship', NULL, 'uploads/gallery/1782392717_c2e7ebaa71ce78fa1f8d6cd50b096643.jpg', '2026-06-25 13:05:17', NULL),
(230, 'IMG_2661', 'worship', NULL, 'uploads/gallery/1782392717_d505424ffdd884b88543e8ce35b5bff2.jpg', '2026-06-25 13:05:17', NULL),
(231, 'IMG_2663', 'worship', NULL, 'uploads/gallery/1782392717_15bd82ddcc1ca03337e4af280a31cd3d.jpg', '2026-06-25 13:05:17', NULL),
(232, 'IMG_2665', 'worship', NULL, 'uploads/gallery/1782392880_fd4ed9589630e9126d210cf8683a526f.jpg', '2026-06-25 13:08:00', NULL),
(233, 'IMG_2666', 'worship', NULL, 'uploads/gallery/1782392880_893da8f47bf826f50c16421c74c9df9c.jpg', '2026-06-25 13:08:00', NULL),
(234, 'IMG_2667', 'worship', NULL, 'uploads/gallery/1782392880_f62a3540ae5b1f7b147708842c95df0c.jpg', '2026-06-25 13:08:00', NULL),
(235, 'IMG_2668', 'worship', NULL, 'uploads/gallery/1782392880_1d8c196813bf10c45e25e46a75667dbd.jpg', '2026-06-25 13:08:00', NULL),
(236, 'IMG_2669', 'worship', NULL, 'uploads/gallery/1782392880_d9fd6611d71c37e70db48ea47a573be8.jpg', '2026-06-25 13:08:00', NULL),
(237, 'IMG_2670', 'worship', NULL, 'uploads/gallery/1782392880_0b6e4bf8aa19c5be3bc738d48b159c82.jpg', '2026-06-25 13:08:00', NULL),
(238, 'IMG_2671', 'worship', NULL, 'uploads/gallery/1782392880_9e4b6357d84ab6b736aa8542d74c6cc9.jpg', '2026-06-25 13:08:00', NULL),
(239, 'IMG_2672', 'worship', NULL, 'uploads/gallery/1782392880_ae948c0361677e42e7a8fe8b58083550.jpg', '2026-06-25 13:08:00', NULL),
(240, 'IMG_2673', 'worship', NULL, 'uploads/gallery/1782392880_ed1bf97b90980beed71506ea48e199ab.jpg', '2026-06-25 13:08:00', NULL),
(241, 'IMG_2674', 'worship', NULL, 'uploads/gallery/1782392880_bf4f10bc0c42d54e357d8931506081f4.jpg', '2026-06-25 13:08:00', NULL),
(242, 'IMG_2675', 'worship', NULL, 'uploads/gallery/1782392880_12fb80159936280319896451f95fbce0.jpg', '2026-06-25 13:08:00', NULL),
(243, 'IMG_2676', 'worship', NULL, 'uploads/gallery/1782392880_51ebb6219c08caa2d5b35a2a4895f618.jpg', '2026-06-25 13:08:00', NULL),
(244, 'IMG_2664', 'worship', NULL, 'uploads/gallery/1782392880_01cdfb78a667b256fcfe820d4e4b712d.jpg', '2026-06-25 13:08:00', NULL),
(245, 'IMG_0377', 'worship', NULL, 'uploads/gallery/1782418104_0ae230b2ecef7161186c038b9a68d7e3.jpg', '2026-06-25 20:08:24', 6),
(246, 'IMG_0396', 'worship', NULL, 'uploads/gallery/1782418104_c53c6e94aa802fce029e46d2e33f3060.jpg', '2026-06-25 20:08:24', 6),
(247, 'IMG_0398', 'worship', NULL, 'uploads/gallery/1782418104_25b89904aa28e7acf9eed44f2f1a7738.jpg', '2026-06-25 20:08:24', 6),
(248, 'IMG_0399', 'worship', NULL, 'uploads/gallery/1782418104_617845026b44faaa8a5790574cc011ce.jpg', '2026-06-25 20:08:24', 6),
(249, 'IMG_0403', 'worship', NULL, 'uploads/gallery/1782418104_376c9011d98921ec1e3bce43b08a64b3.jpg', '2026-06-25 20:08:24', 6),
(250, 'IMG_0404', 'worship', NULL, 'uploads/gallery/1782418104_d62d9b8c94e2f5a745925982e039fabd.jpg', '2026-06-25 20:08:24', 6),
(251, 'IMG_0407', 'worship', NULL, 'uploads/gallery/1782418104_3906dac2528239866724663bcdb076a2.jpg', '2026-06-25 20:08:24', 6),
(252, 'IMG_0409', 'worship', NULL, 'uploads/gallery/1782418104_42935d862b50537b7f6c91069ffd1fea.jpg', '2026-06-25 20:08:24', 6),
(253, 'IMG_0411', 'worship', NULL, 'uploads/gallery/1782418104_c77b16b46928cb709f89c3568f6ae4c3.jpg', '2026-06-25 20:08:24', 6),
(254, 'IMG_0413', 'worship', NULL, 'uploads/gallery/1782418104_e084cf15e54e74ee4c02535e93e3eb85.jpg', '2026-06-25 20:08:24', 6),
(255, 'IMG_0422', 'worship', NULL, 'uploads/gallery/1782418199_7fd16e8db6fcdc52908f8b5a55ba9332.jpg', '2026-06-25 20:09:59', 6),
(256, 'IMG_0423', 'worship', NULL, 'uploads/gallery/1782418199_52867b69fa2f4f584ff9dca27b47f376.jpg', '2026-06-25 20:09:59', 6),
(257, 'IMG_0425', 'worship', NULL, 'uploads/gallery/1782418199_93a0e6d70a2597a5545a30aaf047a924.jpg', '2026-06-25 20:09:59', 6),
(258, 'IMG_0428', 'worship', NULL, 'uploads/gallery/1782418199_8219418d6caa1b5ac7feee86414ac456.jpg', '2026-06-25 20:09:59', 6),
(259, 'IMG_0430', 'worship', NULL, 'uploads/gallery/1782418199_46bfa4e4cda3a5effe10adc7b0b947cd.jpg', '2026-06-25 20:09:59', 6),
(260, 'IMG_0414', 'worship', NULL, 'uploads/gallery/1782418199_7aa2352371a92f6fcacccee812911626.jpg', '2026-06-25 20:09:59', 6),
(261, 'IMG_0416', 'worship', NULL, 'uploads/gallery/1782418199_70eea20cece85d3717e7417505d6a603.jpg', '2026-06-25 20:09:59', 6),
(262, 'IMG_0418', 'worship', NULL, 'uploads/gallery/1782418199_072762a017173d1ff026339f3a373cdf.jpg', '2026-06-25 20:09:59', 6),
(263, 'IMG_0419', 'worship', NULL, 'uploads/gallery/1782418199_267f0eb8250d060713d5482ecee09a15.jpg', '2026-06-25 20:09:59', 6),
(264, 'IMG_0420', 'worship', NULL, 'uploads/gallery/1782418199_9070e2dc92c57cab59ca0081e1145d29.jpg', '2026-06-25 20:09:59', 6),
(265, 'IMG_0442', 'worship', NULL, 'uploads/gallery/1782418319_aea2ae967443a294fc256941280b372e.jpg', '2026-06-25 20:11:59', 6),
(266, 'IMG_0444', 'worship', NULL, 'uploads/gallery/1782418319_5e262c10aa296bb093b1cc87b779303c.jpg', '2026-06-25 20:11:59', 6),
(267, 'IMG_0445', 'worship', NULL, 'uploads/gallery/1782418319_f4d6076427aa31efa3975a8eaf32cb64.jpg', '2026-06-25 20:11:59', 6),
(268, 'IMG_0449', 'worship', NULL, 'uploads/gallery/1782418319_a73703bc92f14aa16651b122bac977a0.jpg', '2026-06-25 20:11:59', 6),
(269, 'IMG_0451', 'worship', NULL, 'uploads/gallery/1782418319_a7ae2ba1062e6c6b6b147c80f0099762.jpg', '2026-06-25 20:11:59', 6),
(270, 'IMG_0432', 'worship', NULL, 'uploads/gallery/1782418319_fa7de94fe8240a5e1824f06030b2d9e3.jpg', '2026-06-25 20:11:59', 6),
(271, 'IMG_0434', 'worship', NULL, 'uploads/gallery/1782418319_739e1515df84504c89b3bc1d64ebf306.jpg', '2026-06-25 20:11:59', 6),
(272, 'IMG_0435', 'worship', NULL, 'uploads/gallery/1782418319_313cb793f40a72edad42e7394c73da64.jpg', '2026-06-25 20:11:59', 6),
(273, 'IMG_0436', 'worship', NULL, 'uploads/gallery/1782418319_230d3a83bc647a1a7a4fee03c91cd4a7.jpg', '2026-06-25 20:11:59', 6),
(274, 'IMG_0438', 'worship', NULL, 'uploads/gallery/1782418319_0e275b3e7037f939e693ad960b9815b1.jpg', '2026-06-25 20:11:59', 6),
(275, 'IMG_0453', 'worship', NULL, 'uploads/gallery/1782418375_b2ec4abf53c5970b8700b6dfea96af37.jpg', '2026-06-25 20:12:55', 6),
(276, 'IMG_0457', 'worship', NULL, 'uploads/gallery/1782418375_a43c8838d14395c208c2bae3a1458a93.jpg', '2026-06-25 20:12:55', 6),
(277, 'IMG_0458', 'worship', NULL, 'uploads/gallery/1782418375_91dbb1bbe2f888302f50ca681f2c9cfa.jpg', '2026-06-25 20:12:55', 6),
(278, 'IMG_0460', 'worship', NULL, 'uploads/gallery/1782418375_0ecc9b9b6c3e859ecd83c3ebad331f16.jpg', '2026-06-25 20:12:55', 6),
(279, 'IMG_0462', 'worship', NULL, 'uploads/gallery/1782418375_f0f273852e12bda6c56208ef788d1225.jpg', '2026-06-25 20:12:55', 6),
(280, 'IMG_0463', 'worship', NULL, 'uploads/gallery/1782418375_294d334b8ab11b6d85aef548ac675180.jpg', '2026-06-25 20:12:55', 6),
(281, 'IMG_0466', 'worship', NULL, 'uploads/gallery/1782418375_37c90e12888a0a2c2441f93734f10be3.jpg', '2026-06-25 20:12:55', 6),
(282, 'IMG_0467', 'worship', NULL, 'uploads/gallery/1782418375_9fc3fe498d184db3a9e844449464d55f.jpg', '2026-06-25 20:12:55', 6),
(283, 'IMG_0468', 'worship', NULL, 'uploads/gallery/1782418375_6491a287c860c26f54c881399cdae73e.jpg', '2026-06-25 20:12:55', 6),
(284, 'IMG_0472', 'worship', NULL, 'uploads/gallery/1782418375_042b5a81a6d9abbc517995ef865ec5f2.jpg', '2026-06-25 20:12:55', 6),
(285, 'IMG_0475', 'worship', NULL, 'uploads/gallery/1782418491_143747e88a0226f9695749e89c323a20.jpg', '2026-06-25 20:14:51', 6),
(286, 'IMG_0477', 'worship', NULL, 'uploads/gallery/1782418491_787cf8dfd9100d3320c6b64cba4425dd.jpg', '2026-06-25 20:14:51', 6),
(287, 'IMG_0479', 'worship', NULL, 'uploads/gallery/1782418491_3ccae43e7e0b8f0f8ddbc466a55f6229.jpg', '2026-06-25 20:14:51', 6),
(288, 'IMG_0481', 'worship', NULL, 'uploads/gallery/1782418491_244813f2fa9f77899beecf685a54a07d.jpg', '2026-06-25 20:14:51', 6),
(289, 'IMG_0483', 'worship', NULL, 'uploads/gallery/1782418491_84de19d1deca5a695c420ef85b9cd3a1.jpg', '2026-06-25 20:14:51', 6),
(290, 'IMG_0486', 'worship', NULL, 'uploads/gallery/1782418491_669ab68ad4d53e3d7884267337ba01c1.jpg', '2026-06-25 20:14:51', 6),
(291, 'IMG_0489', 'worship', NULL, 'uploads/gallery/1782418491_9be6861070ec1ed7a5b6ce6bb067f953.jpg', '2026-06-25 20:14:51', 6),
(292, 'IMG_0493', 'worship', NULL, 'uploads/gallery/1782418491_dfb7efc6a4ec4d5d3a8377f044025deb.jpg', '2026-06-25 20:14:51', 6),
(293, 'IMG_0528', 'worship', NULL, 'uploads/gallery/1782418491_2076f91574bca2aee31ef36c9c4ae398.jpg', '2026-06-25 20:14:51', 6),
(294, 'IMG_0532', 'worship', NULL, 'uploads/gallery/1782418491_77da871f3e120e323f83d4cb685a0afc.jpg', '2026-06-25 20:14:51', 6),
(295, 'IMG_0535', 'worship', NULL, 'uploads/gallery/1782418535_13164934650974cfcec56019c24ba9c3.jpg', '2026-06-25 20:15:35', 6),
(296, 'IMG_0538', 'worship', NULL, 'uploads/gallery/1782418535_219d523277e5255b6b20beddd7b8242c.jpg', '2026-06-25 20:15:35', 6),
(297, 'IMG_0539', 'worship', NULL, 'uploads/gallery/1782418535_4506d6d01120163c8ccc64232ebbffa5.jpg', '2026-06-25 20:15:35', 6),
(298, 'IMG_0540', 'worship', NULL, 'uploads/gallery/1782418535_d6f8d124bc956a56cea70a6628b63d3d.jpg', '2026-06-25 20:15:35', 6),
(299, 'IMG_0544', 'worship', NULL, 'uploads/gallery/1782418535_5bda31d0b259fc3a3cc2e933cce0920c.jpg', '2026-06-25 20:15:35', 6),
(300, 'CKAY8708', 'worship', NULL, 'uploads/gallery/1782419020_6a6226d6a5c84451f3af08dc34c990d3.jpg', '2026-06-25 20:23:40', 7),
(301, 'CKAY8720', 'worship', NULL, 'uploads/gallery/1782419020_08bf517fc4f3f1d1413529e260032f3f.jpg', '2026-06-25 20:23:40', 7),
(302, 'CKAY8725', 'worship', NULL, 'uploads/gallery/1782419020_3ff7a11bf0b0bad654482b4ee70e37da.jpg', '2026-06-25 20:23:40', 7),
(303, 'CKAY8726', 'worship', NULL, 'uploads/gallery/1782419020_e8bece4835c02114d85569a04de08bb3.jpg', '2026-06-25 20:23:40', 7),
(304, 'CKAY8730', 'worship', NULL, 'uploads/gallery/1782419020_1b555b4beb2dfcc46762445b52412bb6.jpg', '2026-06-25 20:23:40', 7),
(305, 'CKAY8732', 'worship', NULL, 'uploads/gallery/1782419020_d0c38ed3b6d1005005dad6cce7c0e9eb.jpg', '2026-06-25 20:23:40', 7),
(306, 'CKAY8735', 'worship', NULL, 'uploads/gallery/1782419020_25636c8f4c046bb9bb19e235fd651e33.jpg', '2026-06-25 20:23:40', 7),
(307, 'CKAY8736', 'worship', NULL, 'uploads/gallery/1782419020_7f5d57a09bb86b1f037c6bfd8e7eb860.jpg', '2026-06-25 20:23:40', 7),
(308, 'CKAY8751', 'worship', NULL, 'uploads/gallery/1782419020_b6e5eaaa27c751d77c19ddde339e98ab.jpg', '2026-06-25 20:23:40', 7),
(309, 'CKAY8754', 'worship', NULL, 'uploads/gallery/1782419020_ab866ae999ba0a5019bf91dd28cc0340.jpg', '2026-06-25 20:23:40', 7),
(310, 'CKAY8691', 'worship', NULL, 'uploads/gallery/1782419020_00ecdfdb34c4a4242935bb4bbd8e6ec7.jpg', '2026-06-25 20:23:40', 7),
(311, 'CKAY8697', 'worship', NULL, 'uploads/gallery/1782419020_59de6f5717cd217b01d8375c03e0bcee.jpg', '2026-06-25 20:23:40', 7),
(312, 'CKAY8699', 'worship', NULL, 'uploads/gallery/1782419020_d2229ecb44489cc4ea4bc8f684e64f19.jpg', '2026-06-25 20:23:40', 7),
(313, 'CKAY8703', 'worship', NULL, 'uploads/gallery/1782419020_4f3d9464d8cc63f4428925f67473ab12.jpg', '2026-06-25 20:23:40', 7),
(314, 'CKAY8706', 'worship', NULL, 'uploads/gallery/1782419020_6a73e9e109146bdc54144f1580dea472.jpg', '2026-06-25 20:23:41', 7),
(315, 'CKAY8778', 'worship', NULL, 'uploads/gallery/1782419333_d8831f250fac336ec3dd18232efe6a44.jpg', '2026-06-25 20:28:53', 7),
(316, 'CKAY8781', 'worship', NULL, 'uploads/gallery/1782419333_1811e9c67d07198f8b47ae605cee03f1.jpg', '2026-06-25 20:28:53', 7),
(317, 'CKAY8783', 'worship', NULL, 'uploads/gallery/1782419333_e4e577c4f04c9e37a734c2d03166b9ac.jpg', '2026-06-25 20:28:53', 7),
(318, 'CKAY8755', 'worship', NULL, 'uploads/gallery/1782419333_9e8dbbb8a7d936e4c54d056f68fc1a16.jpg', '2026-06-25 20:28:53', 7),
(319, 'CKAY8756', 'worship', NULL, 'uploads/gallery/1782419333_448f85d9491efe82fbc3ddd350c272b7.jpg', '2026-06-25 20:28:53', 7),
(320, 'CKAY8758', 'worship', NULL, 'uploads/gallery/1782419333_2db47f7afa8ad61b2b9cf16f4777d16e.jpg', '2026-06-25 20:28:53', 7),
(321, 'CKAY8759', 'worship', NULL, 'uploads/gallery/1782419333_28652515a0a18767a222396dc8c2ac45.jpg', '2026-06-25 20:28:53', 7),
(322, 'CKAY8760', 'worship', NULL, 'uploads/gallery/1782419333_737bb0cc38238f44237a5a55ec332b83.jpg', '2026-06-25 20:28:53', 7),
(323, 'CKAY8761', 'worship', NULL, 'uploads/gallery/1782419333_f37bf4867d067e318b8bd86691dc12c3.jpg', '2026-06-25 20:28:53', 7),
(324, 'CKAY8762', 'worship', NULL, 'uploads/gallery/1782419333_df8580b64a37d26e8140db1fa2ad09c7.jpg', '2026-06-25 20:28:53', 7),
(325, 'CKAY8763', 'worship', NULL, 'uploads/gallery/1782419333_4f3b289e8a153d8cfdb02cd481e097cf.jpg', '2026-06-25 20:28:53', 7),
(326, 'CKAY8765', 'worship', NULL, 'uploads/gallery/1782419333_2eb62281e4b063c4fee4c77ffd4af913.jpg', '2026-06-25 20:28:53', 7),
(327, 'CKAY8766', 'worship', NULL, 'uploads/gallery/1782419333_62dac05847606319540f92ddcccbe61a.jpg', '2026-06-25 20:28:53', 7),
(328, 'CKAY8768', 'worship', NULL, 'uploads/gallery/1782419333_ee855fb6ed954ef151c7b0ef99e6e168.jpg', '2026-06-25 20:28:53', 7),
(329, 'CKAY8769', 'worship', NULL, 'uploads/gallery/1782419333_8aa3491a655fb015d6188af8cd341c23.jpg', '2026-06-25 20:28:53', 7),
(330, 'CKAY8770', 'worship', NULL, 'uploads/gallery/1782419333_4a3b62d742cbd4cff90b62eedcbaf727.jpg', '2026-06-25 20:28:53', 7),
(331, 'CKAY8771', 'worship', NULL, 'uploads/gallery/1782419333_6857e9a9834d3ed6caf868ddf156cf38.jpg', '2026-06-25 20:28:53', 7),
(332, 'CKAY8775', 'worship', NULL, 'uploads/gallery/1782419333_9b547e7e9ad46ceb0c1bfc58544cef05.jpg', '2026-06-25 20:28:53', 7),
(333, 'CKAY8776', 'worship', NULL, 'uploads/gallery/1782419333_a54df79d754ef1450714fb23946d9d23.jpg', '2026-06-25 20:28:53', 7),
(334, 'CKAY8777', 'worship', NULL, 'uploads/gallery/1782419333_fd1de1725be692491f290b0a5a19b7ef.jpg', '2026-06-25 20:28:53', 7),
(335, 'CKAY8793', 'worship', NULL, 'uploads/gallery/1782419462_a7a3556e820374ac0bc6c6b07fc00ddb.jpg', '2026-06-25 20:31:02', 7),
(336, 'CKAY8794', 'worship', NULL, 'uploads/gallery/1782419462_7d4194ad4320ea81f9c79819e137c78e.jpg', '2026-06-25 20:31:02', 7),
(337, 'CKAY8795', 'worship', NULL, 'uploads/gallery/1782419462_b681654ba0c21164623d5fab40cd8051.jpg', '2026-06-25 20:31:02', 7),
(338, 'CKAY8797', 'worship', NULL, 'uploads/gallery/1782419462_cb09ae320a8fc141d85c91dd52484727.jpg', '2026-06-25 20:31:02', 7),
(339, 'CKAY8799', 'worship', NULL, 'uploads/gallery/1782419462_57a2b29fd20dd73482260efebdb16270.jpg', '2026-06-25 20:31:02', 7),
(340, 'CKAY8801', 'worship', NULL, 'uploads/gallery/1782419462_ebbb4edc74ae7b3609502ff3a8a57bb4.jpg', '2026-06-25 20:31:02', 7),
(341, 'CKAY8802', 'worship', NULL, 'uploads/gallery/1782419462_609ac06fbbebfd38457a4a916051aae0.jpg', '2026-06-25 20:31:02', 7),
(342, 'CKAY8803', 'worship', NULL, 'uploads/gallery/1782419462_1bc77ec4cc676f3e313177ff52b7211d.jpg', '2026-06-25 20:31:02', 7),
(343, 'CKAY8804', 'worship', NULL, 'uploads/gallery/1782419462_302528de223a281dc853b72fa03bf793.jpg', '2026-06-25 20:31:02', 7),
(344, 'CKAY8808', 'worship', NULL, 'uploads/gallery/1782419462_4ec5ed41cbc90b09cd9c70b1162fbcf3.jpg', '2026-06-25 20:31:02', 7),
(345, 'CKAY8810', 'worship', NULL, 'uploads/gallery/1782419462_2c06c7a84d32bfe8ba39c0b56801ce24.jpg', '2026-06-25 20:31:02', 7),
(346, 'CKAY8811', 'worship', NULL, 'uploads/gallery/1782419462_a0fe3dbad7c791ace4d3807e1b1dbf24.jpg', '2026-06-25 20:31:02', 7),
(347, 'CKAY8812', 'worship', NULL, 'uploads/gallery/1782419462_6d2a185d012dd55ce56700279eea85fa.jpg', '2026-06-25 20:31:02', 7),
(348, 'CKAY8815', 'worship', NULL, 'uploads/gallery/1782419462_da6f2babc0657b9472db7d03e1f5dacb.jpg', '2026-06-25 20:31:02', 7),
(349, 'CKAY8816', 'worship', NULL, 'uploads/gallery/1782419462_0849f9063a322c1d4768d7918ef6febc.jpg', '2026-06-25 20:31:02', 7),
(350, 'CKAY8817', 'worship', NULL, 'uploads/gallery/1782419462_441ce55b7ccebaccc1036a7d63037ebb.jpg', '2026-06-25 20:31:02', 7),
(351, 'CKAY8820', 'worship', NULL, 'uploads/gallery/1782419462_0cf11d831a8611ff9da18a5961195c59.jpg', '2026-06-25 20:31:02', 7),
(352, 'CKAY8821', 'worship', NULL, 'uploads/gallery/1782419462_267be685a6290758dd085b607be2dbd1.jpg', '2026-06-25 20:31:02', 7),
(353, 'CKAY8822', 'worship', NULL, 'uploads/gallery/1782419462_46f9ca03f234b825fbda5b2dd3512f38.jpg', '2026-06-25 20:31:02', 7),
(354, 'CKAY8825', 'worship', NULL, 'uploads/gallery/1782419462_b6d13c0a275b89a6c62d92d33f731676.jpg', '2026-06-25 20:31:02', 7),
(355, 'CKAY8954', 'worship', NULL, 'uploads/gallery/1782419522_fb95651cff018faa0372a048e672b087.jpg', '2026-06-25 20:32:02', 7),
(356, 'CKAY8955', 'worship', NULL, 'uploads/gallery/1782419522_18d5f974922c2fbf6b9fa53a4ef47b5b.jpg', '2026-06-25 20:32:02', 7),
(357, 'CKAY8833', 'worship', NULL, 'uploads/gallery/1782419522_18289ff0dd037de1c83f40b3d96cebe5.jpg', '2026-06-25 20:32:02', 7),
(358, 'CKAY8834', 'worship', NULL, 'uploads/gallery/1782419522_691ad32a84fdee0447ff5259c656d38f.jpg', '2026-06-25 20:32:02', 7),
(359, 'CKAY8835', 'worship', NULL, 'uploads/gallery/1782419522_7d7518e753ef028d297bd91dc9c2e073.jpg', '2026-06-25 20:32:02', 7),
(360, 'CKAY8847', 'worship', NULL, 'uploads/gallery/1782419522_a1ab59368a283bf934b33215afd0508d.jpg', '2026-06-25 20:32:02', 7),
(361, 'CKAY8859', 'worship', NULL, 'uploads/gallery/1782419522_7337e1e03da7b0b459f4ce36d47039e3.jpg', '2026-06-25 20:32:02', 7),
(362, 'IMG_9683', 'worship', NULL, 'uploads/gallery/1782422933_eeca620c77cf371fb83bba2136d9f467.jpg', '2026-06-25 21:28:53', 7),
(363, 'IMG_9655', 'worship', NULL, 'uploads/gallery/1782422933_9966be0dd261a4de85fc6f23248271b8.jpg', '2026-06-25 21:28:53', 7),
(364, 'IMG_9661', 'worship', NULL, 'uploads/gallery/1782422933_e0ed9249b57186efcaaae6a99d73606e.jpg', '2026-06-25 21:28:53', 7),
(365, 'IMG_9663', 'worship', NULL, 'uploads/gallery/1782422933_47f4b4e6dc3c9883c948baac2ef2c9b0.jpg', '2026-06-25 21:28:53', 7),
(366, 'IMG_9665', 'worship', NULL, 'uploads/gallery/1782422933_e7508ad411f5218a729636ede99051a2.jpg', '2026-06-25 21:28:53', 7),
(367, 'IMG_9666', 'worship', NULL, 'uploads/gallery/1782422933_6b49eadb3895566b116e3d2ef1e83d28.jpg', '2026-06-25 21:28:53', 7),
(368, 'IMG_9670', 'worship', NULL, 'uploads/gallery/1782422933_2261b54eb9183f8252b8a865a055f9d8.jpg', '2026-06-25 21:28:53', 7),
(369, 'IMG_9675', 'worship', NULL, 'uploads/gallery/1782422933_cc2fd307a1d80aea48a94bca0bd8088d.jpg', '2026-06-25 21:28:53', 7),
(370, 'IMG_9680', 'worship', NULL, 'uploads/gallery/1782422933_428742ca18149b2139f18dbd8aab6a13.jpg', '2026-06-25 21:28:53', 7),
(371, 'IMG_9682', 'worship', NULL, 'uploads/gallery/1782422933_a716ea8025f33fc7f6a1a293662409c8.jpg', '2026-06-25 21:28:53', 7),
(372, 'IMG_9685', 'worship', NULL, 'uploads/gallery/1782423034_bdd28734795be0ff93601f0c3c88d91f.jpg', '2026-06-25 21:30:34', 7),
(373, 'IMG_9687', 'worship', NULL, 'uploads/gallery/1782423034_8223bfec00b8a423b5efdc78e076599d.jpg', '2026-06-25 21:30:34', 7),
(374, 'IMG_9690', 'worship', NULL, 'uploads/gallery/1782423034_7b6098c45a8d2895777c7f02271d052f.jpg', '2026-06-25 21:30:34', 7),
(375, 'IMG_9692', 'worship', NULL, 'uploads/gallery/1782423034_0a7096adc7fc2ad2177d268e7ae0e3b6.jpg', '2026-06-25 21:30:34', 7),
(376, 'IMG_9694', 'worship', NULL, 'uploads/gallery/1782423034_3cff467775d932f4f05b93feaa966799.jpg', '2026-06-25 21:30:34', 7),
(377, 'IMG_9696', 'worship', NULL, 'uploads/gallery/1782423034_2d1d84f91149ed874dde72c6f5b55101.jpg', '2026-06-25 21:30:34', 7),
(378, 'IMG_9697', 'worship', NULL, 'uploads/gallery/1782423034_0bdcc11650b7a999499dc81df81b37bb.jpg', '2026-06-25 21:30:34', 7),
(379, 'IMG_9700', 'worship', NULL, 'uploads/gallery/1782423034_12fd243debcd42aaddc2c9f8f21b78eb.jpg', '2026-06-25 21:30:34', 7),
(380, 'IMG_9701', 'worship', NULL, 'uploads/gallery/1782423034_54a7ffe76b0241e1c0bb0b6abb72fab1.jpg', '2026-06-25 21:30:34', 7),
(381, 'IMG_9702', 'worship', NULL, 'uploads/gallery/1782423034_a63729a879e191e94ec91cfc55803d90.jpg', '2026-06-25 21:30:34', 7),
(382, 'IMG_9703', 'worship', NULL, 'uploads/gallery/1782423034_f5a8aaf1a62e804c7d7d38f9bc542883.jpg', '2026-06-25 21:30:34', 7),
(383, 'IMG_9704', 'worship', NULL, 'uploads/gallery/1782423034_ff603648655a8ab4597d61af5b332d39.jpg', '2026-06-25 21:30:34', 7),
(384, 'IMG_9706', 'worship', NULL, 'uploads/gallery/1782423034_67605b53b359ff1f4c95a4d932927d6d.jpg', '2026-06-25 21:30:34', 7),
(385, 'IMG_9707', 'worship', NULL, 'uploads/gallery/1782423034_b6db7c2357f8bc83e57d86a9a61d2d8c.jpg', '2026-06-25 21:30:34', 7),
(386, 'IMG_9708', 'worship', NULL, 'uploads/gallery/1782423034_dad60f6c69a0cd2099a42d5fce361af9.jpg', '2026-06-25 21:30:34', 7),
(387, 'IMG_0421', 'worship', NULL, 'uploads/gallery/1782503553_74004149b0bad6dae14627cfb435ec08.jpg', '2026-06-26 19:52:33', 8),
(388, 'IMG_0432', 'worship', NULL, 'uploads/gallery/1782503553_642ac4391422f6f0457246876dc8e451.jpg', '2026-06-26 19:52:33', 8),
(389, 'IMG_0434', 'worship', NULL, 'uploads/gallery/1782503553_70174a93b8e957f75534f1e8d56ad751.jpg', '2026-06-26 19:52:33', 8),
(390, 'IMG_0439', 'worship', NULL, 'uploads/gallery/1782503553_a40f3948f07681eaecbdabdd6778d690.jpg', '2026-06-26 19:52:33', 8),
(391, 'IMG_0444', 'worship', NULL, 'uploads/gallery/1782503553_562d2d01df0c7deba2505963899efad6.jpg', '2026-06-26 19:52:33', 8),
(392, 'IMG_0446', 'worship', NULL, 'uploads/gallery/1782503553_94a0ed63d336935f07dbb2602a80c242.jpg', '2026-06-26 19:52:33', 8),
(393, 'IMG_0448', 'worship', NULL, 'uploads/gallery/1782503553_48003e064af7929998618758ed591dff.jpg', '2026-06-26 19:52:33', 8),
(394, 'IMG_0479', 'worship', NULL, 'uploads/gallery/1782503553_5e5bdbdaa2e9f0a1fe8cd272ab8a1560.jpg', '2026-06-26 19:52:33', 8),
(395, 'IMG_0480', 'worship', NULL, 'uploads/gallery/1782503553_46596d7e8bb450cf1d5fade1830da6d5.jpg', '2026-06-26 19:52:33', 8),
(396, 'IMG_0485', 'worship', NULL, 'uploads/gallery/1782503553_65dea0f933f6e5c6a2091d638973915d.jpg', '2026-06-26 19:52:33', 8),
(397, 'IMG_0497', 'worship', NULL, 'uploads/gallery/1782503784_3295c0820c63689d847b0e6965793d7e.jpg', '2026-06-26 19:56:24', 8),
(398, 'IMG_0500', 'worship', NULL, 'uploads/gallery/1782503784_548e7e0bf1f6d11ede212ded12eec259.jpg', '2026-06-26 19:56:24', 8),
(399, 'IMG_0504', 'worship', NULL, 'uploads/gallery/1782503784_b449af092d2f054e79e168402a13bef1.jpg', '2026-06-26 19:56:24', 8),
(400, 'IMG_0505', 'worship', NULL, 'uploads/gallery/1782503784_5ed4212d2228b50ae622e1ed9206fffc.jpg', '2026-06-26 19:56:24', 8),
(401, 'IMG_0506', 'worship', NULL, 'uploads/gallery/1782503784_e29ab87163ccb02f5c62dddf2636fd77.jpg', '2026-06-26 19:56:24', 8),
(402, 'IMG_0486', 'worship', NULL, 'uploads/gallery/1782503784_41f9d8de27a579ccb69bf4d676bec3ca.jpg', '2026-06-26 19:56:24', 8),
(403, 'IMG_0487', 'worship', NULL, 'uploads/gallery/1782503784_ee94a326e22d15282a7b73191c7e089b.jpg', '2026-06-26 19:56:24', 8),
(404, 'IMG_0491', 'worship', NULL, 'uploads/gallery/1782503784_a210287b90e5ec2cfc60bcda47e7e1f9.jpg', '2026-06-26 19:56:24', 8),
(405, 'IMG_0494', 'worship', NULL, 'uploads/gallery/1782503784_92895314dd453e83f8dfda400326b46d.jpg', '2026-06-26 19:56:24', 8),
(406, 'IMG_0496', 'worship', NULL, 'uploads/gallery/1782503784_a71031600b194e06fd1657828fc05a32.jpg', '2026-06-26 19:56:24', 8),
(407, 'IMG_0522', 'worship', NULL, 'uploads/gallery/1782503878_62f28db2cd87540f94d60f71cabfc043.jpg', '2026-06-26 19:57:58', 8),
(408, 'IMG_0525', 'worship', NULL, 'uploads/gallery/1782503878_dbfc3b0ec0770a696b05b07466c985be.jpg', '2026-06-26 19:57:58', 8),
(409, 'IMG_0528', 'worship', NULL, 'uploads/gallery/1782503878_058bd7f09f251267f107ec0207e23f51.jpg', '2026-06-26 19:57:58', 8);
INSERT INTO `gallery` (`id`, `title`, `category`, `description`, `image_url`, `created_at`, `album_id`) VALUES
(410, 'IMG_0529', 'worship', NULL, 'uploads/gallery/1782503878_04248c469baa79486b04707b903fb8de.jpg', '2026-06-26 19:57:58', 8),
(411, 'IMG_0539', 'worship', NULL, 'uploads/gallery/1782503878_8ae7c4378df9d362aa0c47556f5a3bb7.jpg', '2026-06-26 19:57:58', 8),
(412, 'IMG_0508', 'worship', NULL, 'uploads/gallery/1782503878_64ef9174e0c0345cc50f3804c5bdc431.jpg', '2026-06-26 19:57:58', 8),
(413, 'IMG_0511', 'worship', NULL, 'uploads/gallery/1782503878_d2720f38a8bd1c12c3319e9c01476d5f.jpg', '2026-06-26 19:57:58', 8),
(414, 'IMG_0512', 'worship', NULL, 'uploads/gallery/1782503878_680dfa2085fb77fe187993e692e536c4.jpg', '2026-06-26 19:57:58', 8),
(415, 'IMG_0513', 'worship', NULL, 'uploads/gallery/1782503878_68bb87933826ab55bcf3a6316432506e.jpg', '2026-06-26 19:57:58', 8),
(416, 'IMG_0520', 'worship', NULL, 'uploads/gallery/1782503878_9a9bf252438af00f1686ab994a76077f.jpg', '2026-06-26 19:57:58', 8),
(417, 'IMG_0542', 'worship', NULL, 'uploads/gallery/1782503963_2fee9f494a7eb47bd62b45efff1aa436.jpg', '2026-06-26 19:59:23', 8),
(418, 'IMG_0543', 'worship', NULL, 'uploads/gallery/1782503963_aebd3aaa02b08e54f1cdecff5074cfbd.jpg', '2026-06-26 19:59:23', 8),
(419, 'IMG_0544', 'worship', NULL, 'uploads/gallery/1782503963_e0bbd3a383b55e0c54a99412120ac5fe.jpg', '2026-06-26 19:59:23', 8),
(420, 'IMG_0548', 'worship', NULL, 'uploads/gallery/1782503963_6d5de08430d3d9c1052c181993e141fe.jpg', '2026-06-26 19:59:23', 8),
(421, 'IMG_0551', 'worship', NULL, 'uploads/gallery/1782503963_f1667169a351b2e5a562fc15f26b7057.jpg', '2026-06-26 19:59:23', 8),
(422, 'IMG_0554', 'worship', NULL, 'uploads/gallery/1782503963_cfd22a003159f5052bee17534e2cc814.jpg', '2026-06-26 19:59:23', 8),
(423, 'IMG_0561', 'worship', NULL, 'uploads/gallery/1782503963_faa539cf9df2182d2c22faf957fdf245.jpg', '2026-06-26 19:59:23', 8),
(424, 'IMG_0567', 'worship', NULL, 'uploads/gallery/1782503963_7be363959249ceb7f8261be583bb9189.jpg', '2026-06-26 19:59:23', 8),
(425, 'IMG_0574', 'worship', NULL, 'uploads/gallery/1782503963_9bce49fd5a7cde91fbf26fb251bb9ac7.jpg', '2026-06-26 19:59:23', 8),
(426, 'IMG_0578', 'worship', NULL, 'uploads/gallery/1782503963_b426021c47c28dfab6d93acfcb64f111.jpg', '2026-06-26 19:59:23', 8),
(427, 'IMG_0598', 'worship', NULL, 'uploads/gallery/1782504031_c5ad1fd6c845606c8811a97edd4ac094.jpg', '2026-06-26 20:00:31', 8),
(428, 'IMG_0603', 'worship', NULL, 'uploads/gallery/1782504031_fdca62928096e1d0cf03123ff9d0452a.jpg', '2026-06-26 20:00:31', 8),
(429, 'IMG_0606', 'worship', NULL, 'uploads/gallery/1782504031_57a6da64d91f49c8a9c0f7af938e14ed.jpg', '2026-06-26 20:00:31', 8),
(430, 'IMG_0609', 'worship', NULL, 'uploads/gallery/1782504031_7ecc01ad5ee7d28706095d42cca1d794.jpg', '2026-06-26 20:00:31', 8),
(431, 'IMG_0611', 'worship', NULL, 'uploads/gallery/1782504031_f3fa8a8677eba128070ba272d1208bdd.jpg', '2026-06-26 20:00:31', 8),
(432, 'IMG_0579', 'worship', NULL, 'uploads/gallery/1782504031_f05dcf78529f6fe99a5b29a62ec330eb.jpg', '2026-06-26 20:00:31', 8),
(433, 'IMG_0583', 'worship', NULL, 'uploads/gallery/1782504031_2fffa525c7c6218d42a9d31f04e2737d.jpg', '2026-06-26 20:00:31', 8),
(434, 'IMG_0584', 'worship', NULL, 'uploads/gallery/1782504031_9e4c52f455e58a8ab654161251cf5c3c.jpg', '2026-06-26 20:00:31', 8),
(435, 'IMG_0585', 'worship', NULL, 'uploads/gallery/1782504031_cdb90593d911fa38ef143a46a1047352.jpg', '2026-06-26 20:00:31', 8),
(436, 'IMG_0597', 'worship', NULL, 'uploads/gallery/1782504031_9da708f6a7ea499aa8a618418c65f0fb.jpg', '2026-06-26 20:00:31', 8),
(437, 'IMG_0612', 'worship', NULL, 'uploads/gallery/1782504095_bb2034a6d30115ed6b2117b12b33fa37.jpg', '2026-06-26 20:01:35', 8),
(438, 'IMG_0613', 'worship', NULL, 'uploads/gallery/1782504095_9f44062c3ac2e75e57ac2570da5a136b.jpg', '2026-06-26 20:01:35', 8),
(439, 'IMG_0620', 'worship', NULL, 'uploads/gallery/1782504095_3330540f9e99e45e421ba6d3687f448f.jpg', '2026-06-26 20:01:35', 8),
(440, 'IMG_0623', 'worship', NULL, 'uploads/gallery/1782504095_f6dcc034481946883a137de2e8cbcd71.jpg', '2026-06-26 20:01:35', 8),
(441, 'IMG_0624', 'worship', NULL, 'uploads/gallery/1782504095_f661cd7457276d9ad7d6812f6d5f36ee.jpg', '2026-06-26 20:01:35', 8),
(442, 'IMG_0626', 'worship', NULL, 'uploads/gallery/1782504095_2720e500a4ad1e9ea18b5ccb8bbd8c74.jpg', '2026-06-26 20:01:35', 8),
(443, 'IMG_0629', 'worship', NULL, 'uploads/gallery/1782504095_6610a2a15d7b79a234f1fb140f007ed6.jpg', '2026-06-26 20:01:35', 8),
(444, 'IMG_0637', 'worship', NULL, 'uploads/gallery/1782504095_c6f23668e94b9c081cb915dfe8165ee1.jpg', '2026-06-26 20:01:35', 8),
(445, 'IMG_0638', 'worship', NULL, 'uploads/gallery/1782504095_6738708cea94b927fd57b20ee70381eb.jpg', '2026-06-26 20:01:35', 8),
(446, 'IMG_0639', 'worship', NULL, 'uploads/gallery/1782504095_4297da952258fd0089f3777af1f10fc0.jpg', '2026-06-26 20:01:35', 8),
(447, 'IMG_0770', 'worship', NULL, 'uploads/gallery/1782504235_fcd95440d9c53d42a5d1f948b2b453a4.jpg', '2026-06-26 20:03:55', 8),
(448, 'IMG_0772', 'worship', NULL, 'uploads/gallery/1782504235_05ca2fb90c45decf8a3cfcfe1e4c41cc.jpg', '2026-06-26 20:03:55', 8),
(449, 'IMG_0644', 'worship', NULL, 'uploads/gallery/1782504235_4eba8f590d5872eaecd299f313abfe67.jpg', '2026-06-26 20:03:55', 8),
(450, 'IMG_0655', 'worship', NULL, 'uploads/gallery/1782504235_74c0170d21610e7cd459148043eb36a4.jpg', '2026-06-26 20:03:55', 8),
(451, 'IMG_0665', 'worship', NULL, 'uploads/gallery/1782504235_b1f2074063bcb4bd2d915ee3176748e5.jpg', '2026-06-26 20:03:55', 8),
(452, 'IMG_0668', 'worship', NULL, 'uploads/gallery/1782504235_5b6140bdb37e3d6865b4fc75664d2c4d.jpg', '2026-06-26 20:03:55', 8),
(453, 'IMG_0672', 'worship', NULL, 'uploads/gallery/1782504235_0bec5f6e0661e84bb0071543e8199909.jpg', '2026-06-26 20:03:55', 8),
(454, 'IMG_0676', 'worship', NULL, 'uploads/gallery/1782504235_44c00a8ded759c032d5f67268087a558.jpg', '2026-06-26 20:03:55', 8),
(455, 'IMG_0679', 'worship', NULL, 'uploads/gallery/1782504235_0c9587cdc9f21e5062f03be6e86b7252.jpg', '2026-06-26 20:03:55', 8),
(456, 'IMG_0693', 'worship', NULL, 'uploads/gallery/1782504235_e5f5fd480e20071d322255a4bf43e012.jpg', '2026-06-26 20:03:55', 8),
(457, 'IMG_0695', 'worship', NULL, 'uploads/gallery/1782504235_83e1ac55a2c8c07df87d09e609bc25ad.jpg', '2026-06-26 20:03:55', 8),
(458, 'IMG_0711', 'worship', NULL, 'uploads/gallery/1782504235_6f0025631c6338df7ae10b5423c77f16.jpg', '2026-06-26 20:03:55', 8),
(459, 'IMG_0754', 'worship', NULL, 'uploads/gallery/1782504235_1ca466b8a8adf0aabf7bcd0c35ec6008.jpg', '2026-06-26 20:03:55', 8),
(460, 'IMG_0756', 'worship', NULL, 'uploads/gallery/1782504235_2bdaf00a8a8b471ef37dd2c835223829.jpg', '2026-06-26 20:03:55', 8),
(461, 'IMG_0758', 'worship', NULL, 'uploads/gallery/1782504235_9eab4a8805564d3a04ff7a52cd894c56.jpg', '2026-06-26 20:03:55', 8),
(462, 'IMG_0768', 'worship', NULL, 'uploads/gallery/1782504235_cf126af747431da0a2141b9efb8070f1.jpg', '2026-06-26 20:03:55', 8),
(463, 'IMG_1020', 'worship', NULL, 'uploads/gallery/1782504478_012c3d83e7048f9dcfac64efd3f9c95c.jpg', '2026-06-26 20:07:58', 8),
(464, 'IMG_1023', 'worship', NULL, 'uploads/gallery/1782504478_2338f3baa1732ce01ec5c9b50d8f4f13.jpg', '2026-06-26 20:07:58', 8),
(465, 'IMG_1024', 'worship', NULL, 'uploads/gallery/1782504478_e216a41a249859783f4f3d16dde0cedc.jpg', '2026-06-26 20:07:58', 8),
(466, 'IMG_1025', 'worship', NULL, 'uploads/gallery/1782504478_19902555fd3f742880b2497a20ea1c53.jpg', '2026-06-26 20:07:58', 8),
(467, 'IMG_1030', 'worship', NULL, 'uploads/gallery/1782504478_a096e4dc47ab50d8c4c4a7c04f097cfb.jpg', '2026-06-26 20:07:58', 8),
(468, 'IMG_1043', 'worship', NULL, 'uploads/gallery/1782504478_9f00ab4d0668ea1f5b7fa548834c78a2.jpg', '2026-06-26 20:07:58', 8),
(469, 'IMG_1044', 'worship', NULL, 'uploads/gallery/1782504478_949a4cc65d72c8fa00f4cb6deed21646.jpg', '2026-06-26 20:07:58', 8),
(470, 'IMG_1045', 'worship', NULL, 'uploads/gallery/1782504478_9fed43ffcc28d13d5a67fee11fe44a52.jpg', '2026-06-26 20:07:58', 8),
(471, 'IMG_1015', 'worship', NULL, 'uploads/gallery/1782504478_840e8d54b4b3eade15ed3acdfc2981b5.jpg', '2026-06-26 20:07:58', 8),
(472, 'IMG_1016', 'worship', NULL, 'uploads/gallery/1782504478_18a79286f60a3a77b42d5bc93e5c9032.jpg', '2026-06-26 20:07:58', 8),
(473, 'IMG_0880', 'worship', NULL, 'uploads/gallery/1782504547_b33467e7f73dc008c2c812d58024c2d6.jpg', '2026-06-26 20:09:07', 8),
(474, 'IMG_0897', 'worship', NULL, 'uploads/gallery/1782504547_0f53223f818c7df4b51c8cd9667f622c.jpg', '2026-06-26 20:09:07', 8),
(475, 'IMG_0909', 'worship', NULL, 'uploads/gallery/1782504547_b88e3937da27e52aff32e82b6554fe9d.jpg', '2026-06-26 20:09:07', 8),
(476, 'IMG_0920', 'worship', NULL, 'uploads/gallery/1782504547_1c9edfcd2f4acfb5732a327b17bf1e16.jpg', '2026-06-26 20:09:07', 8),
(477, 'IMG_0930', 'worship', NULL, 'uploads/gallery/1782504547_b4924afa858b63caa000a3b6b70e919d.jpg', '2026-06-26 20:09:07', 8),
(478, 'IMG_0931', 'worship', NULL, 'uploads/gallery/1782504547_76f2c3de053982a43e9a3f13ea8557a1.jpg', '2026-06-26 20:09:07', 8),
(479, 'IMG_0939', 'worship', NULL, 'uploads/gallery/1782504547_e9e18ba7b2ec7ec9fb14d408b6e696f7.jpg', '2026-06-26 20:09:07', 8),
(480, 'IMG_0945', 'worship', NULL, 'uploads/gallery/1782504547_36a39b57b5250f2184a9502244ba402c.jpg', '2026-06-26 20:09:07', 8),
(481, 'IMG_0954', 'worship', NULL, 'uploads/gallery/1782504547_6ef67ad73c8d52e23c706087fc35260a.jpg', '2026-06-26 20:09:07', 8),
(482, 'IMG_0956', 'worship', NULL, 'uploads/gallery/1782504547_dc87d30269d5d59536e04bcbb62f6eff.jpg', '2026-06-26 20:09:07', 8),
(483, 'IMG_0866', 'worship', NULL, 'uploads/gallery/1782504666_8f7240dc2384d4f910da2be92ef383c7.jpg', '2026-06-26 20:11:06', 8),
(484, 'IMG_0867', 'worship', NULL, 'uploads/gallery/1782504666_150569e8c6b79adbc64e1933db532cd0.jpg', '2026-06-26 20:11:06', 8),
(485, 'IMG_0879', 'worship', NULL, 'uploads/gallery/1782504666_1406faa6443b252c910b954e9edb04ef.jpg', '2026-06-26 20:11:06', 8),
(486, 'IMG_0841', 'worship', NULL, 'uploads/gallery/1782504666_1f6f6d1f8e40b55409bb46639b87f388.jpg', '2026-06-26 20:11:06', 8),
(487, 'IMG_0852', 'worship', NULL, 'uploads/gallery/1782504666_22313fff4c77dbf0a1a2c6d3de7b5bb9.jpg', '2026-06-26 20:11:06', 8),
(488, 'IMG_0859', 'worship', NULL, 'uploads/gallery/1782504666_9dd7fb1cb553d455a520513d8f187a82.jpg', '2026-06-26 20:11:06', 8),
(489, 'IMG_0862', 'worship', NULL, 'uploads/gallery/1782504666_7b1387a62a9df28ec42006823973292f.jpg', '2026-06-26 20:11:06', 8),
(490, 'IMG_1043', 'worship', NULL, 'uploads/gallery/1782504797_40d8192b74a8d33a8480426c389c2478.jpg', '2026-06-26 20:13:17', 8),
(491, 'IMG_1044', 'worship', NULL, 'uploads/gallery/1782504797_9587650f40fbdbe1c45cc229dfa7e913.jpg', '2026-06-26 20:13:17', 8),
(492, 'IMG_1045', 'worship', NULL, 'uploads/gallery/1782504797_90f2c60c8a2602b0ee949c48e014a2d6.jpg', '2026-06-26 20:13:17', 8),
(493, 'IMG_1049', 'worship', NULL, 'uploads/gallery/1782504797_9d708ca82542c973298e62dafc2cc7dc.jpg', '2026-06-26 20:13:17', 8),
(494, 'IMG_1066', 'worship', NULL, 'uploads/gallery/1782504797_08dfa7b00270ee61a96e0910108eaecc.jpg', '2026-06-26 20:13:17', 8),
(495, 'IMG_1067', 'worship', NULL, 'uploads/gallery/1782504797_0ab865b78ddebe0b5c86db0c3b9c758f.jpg', '2026-06-26 20:13:17', 8),
(496, 'IMG_1071', 'worship', NULL, 'uploads/gallery/1782504797_93f70f695a6677ecdf0702ff35951310.jpg', '2026-06-26 20:13:17', 8),
(497, 'IMG_1073', 'worship', NULL, 'uploads/gallery/1782504797_042849fe753ec750e5ae48064cede4d3.jpg', '2026-06-26 20:13:17', 8),
(498, 'IMG_1074', 'worship', NULL, 'uploads/gallery/1782504797_520a5e880bc9bb390762a925370d3f68.jpg', '2026-06-26 20:13:17', 8),
(499, 'IMG_1075', 'worship', NULL, 'uploads/gallery/1782504797_2d2a058ed96430add2baeb0304c29d1b.jpg', '2026-06-26 20:13:17', 8),
(500, 'IMG_1076', 'worship', NULL, 'uploads/gallery/1782504797_255d1e98cb3c884107b43309c3641079.jpg', '2026-06-26 20:13:17', 8),
(501, 'IMG_1092', 'worship', NULL, 'uploads/gallery/1782505397_b0d85009ed1c00bfe6cb5e18af952b15.jpg', '2026-06-26 20:23:17', 8),
(502, 'IMG_1094', 'worship', NULL, 'uploads/gallery/1782505397_da094d5380f3120dc7314ee3fb92ac7a.jpg', '2026-06-26 20:23:17', 8),
(503, 'IMG_1095', 'worship', NULL, 'uploads/gallery/1782505397_37719c9074775983e16a6ee2b282d0e1.jpg', '2026-06-26 20:23:17', 8),
(504, 'IMG_1142 - Copy', 'worship', NULL, 'uploads/gallery/1782505397_ff4e9db39d43793f1ee8fbe3cbcbd09f.jpg', '2026-06-26 20:23:17', 8),
(505, 'IMG_1143 - Copy', 'worship', NULL, 'uploads/gallery/1782505397_0b45aee281413a7fe3d831a47dca7e0f.jpg', '2026-06-26 20:23:17', 8),
(506, 'IMG_1151 - Copy', 'worship', NULL, 'uploads/gallery/1782505397_3d5eda004a82ef1bf918cc2b6213f2b7.jpg', '2026-06-26 20:23:17', 8),
(507, 'IMG_1085', 'worship', NULL, 'uploads/gallery/1782505397_caed4600ba62d9f5e379ecb1b4fc306a.jpg', '2026-06-26 20:23:17', 8),
(508, 'IMG_1086', 'worship', NULL, 'uploads/gallery/1782505397_a3f4faac3359d87434c0a2c0f1c6cef0.jpg', '2026-06-26 20:23:17', 8),
(509, 'IMG_1088', 'worship', NULL, 'uploads/gallery/1782505397_70f365803942f76eb791db5b393d2a06.jpg', '2026-06-26 20:23:17', 8),
(510, 'IMG_1089', 'worship', NULL, 'uploads/gallery/1782505397_9dd36f3a6ea6ef8d5d0b6b83a65c1b61.jpg', '2026-06-26 20:23:17', 8),
(511, 'IMG_1091', 'worship', NULL, 'uploads/gallery/1782505397_b9fe38ac41b84332190964af0fd9c09d.jpg', '2026-06-26 20:23:17', 8),
(512, 'IMG_0600', 'worship', NULL, 'uploads/gallery/1782505964_73948e865e2454bc27c8a22d592923a9.jpg', '2026-06-26 20:32:44', 6),
(513, 'IMG_0603', 'worship', NULL, 'uploads/gallery/1782505964_e06d945622bb9426e283013fc5f338a6.jpg', '2026-06-26 20:32:44', 6),
(514, 'IMG_0604', 'worship', NULL, 'uploads/gallery/1782505964_982733d89738f03f88680235385052da.jpg', '2026-06-26 20:32:44', 6),
(515, 'IMG_0608', 'worship', NULL, 'uploads/gallery/1782505964_009837e3bc851806801d504b5f22acf7.jpg', '2026-06-26 20:32:44', 6),
(516, 'IMG_0609', 'worship', NULL, 'uploads/gallery/1782505964_8d2160034295328089c89a994ecad897.jpg', '2026-06-26 20:32:44', 6),
(517, 'IMG_0582', 'worship', NULL, 'uploads/gallery/1782505964_08bcf1d49e519667ed44245c012c3dca.jpg', '2026-06-26 20:32:44', 6),
(518, 'IMG_0584', 'worship', NULL, 'uploads/gallery/1782505964_30aabae4c3155115582843b051b98647.jpg', '2026-06-26 20:32:44', 6),
(519, 'IMG_0586', 'worship', NULL, 'uploads/gallery/1782505964_651021ec999ae8460d2675038b9b469d.jpg', '2026-06-26 20:32:44', 6),
(520, 'IMG_0597', 'worship', NULL, 'uploads/gallery/1782505964_7b4fcbc78a145e11d623cbb579c1fff3.jpg', '2026-06-26 20:32:44', 6),
(521, 'IMG_0599', 'worship', NULL, 'uploads/gallery/1782505964_8fb1d80a6e79617c2404c1dbf02204b0.jpg', '2026-06-26 20:32:44', 6),
(522, 'IMG_0629', 'worship', NULL, 'uploads/gallery/1782506030_e48202d2de572520f4ec244b49e77778.jpg', '2026-06-26 20:33:50', 8),
(523, 'IMG_0631', 'worship', NULL, 'uploads/gallery/1782506030_e30344f63469938e32fff09f36dd05b9.jpg', '2026-06-26 20:33:50', 8),
(524, 'IMG_0632', 'worship', NULL, 'uploads/gallery/1782506030_9adbb44f3d95717dcd3b4349a3f0cf6b.jpg', '2026-06-26 20:33:50', 8),
(525, 'IMG_0635', 'worship', NULL, 'uploads/gallery/1782506030_3983855722928eb23a45aedf8ef668ef.jpg', '2026-06-26 20:33:50', 8),
(526, 'IMG_0637', 'worship', NULL, 'uploads/gallery/1782506030_d698ef4d2ba8d6521d4ad8b218de2a59.jpg', '2026-06-26 20:33:50', 8),
(527, 'IMG_0638', 'worship', NULL, 'uploads/gallery/1782506030_35cf9aebb6ead918b6cf9f861952b700.jpg', '2026-06-26 20:33:50', 8),
(528, 'IMG_0639', 'worship', NULL, 'uploads/gallery/1782506030_4ba356fd812ade14e1349a6f0645dd24.jpg', '2026-06-26 20:33:50', 8),
(529, 'IMG_0612', 'worship', NULL, 'uploads/gallery/1782506030_3e5bcbf2a6539f5b9bae076f58d3df10.jpg', '2026-06-26 20:33:50', 8),
(530, 'IMG_0615', 'worship', NULL, 'uploads/gallery/1782506030_fc7f4c1491b0c6c535f0e13b28c6c7e4.jpg', '2026-06-26 20:33:50', 8),
(531, 'IMG_0619', 'worship', NULL, 'uploads/gallery/1782506030_16c209c4e4abb9ab60c56db6f8b82532.jpg', '2026-06-26 20:33:50', 8),
(532, 'IMG_0620', 'worship', NULL, 'uploads/gallery/1782506030_1765d8e4ee32d159a2d0134d171b445f.jpg', '2026-06-26 20:33:50', 8),
(533, 'IMG_0626', 'worship', NULL, 'uploads/gallery/1782506030_d9b7c560479c66054bc4b990b1ec2932.jpg', '2026-06-26 20:33:50', 8),
(534, 'IMG_0705', 'worship', NULL, 'uploads/gallery/1782506179_dbe896bdd7cfba87b3bec82be9b20de9.jpg', '2026-06-26 20:36:19', 8),
(535, 'IMG_0706', 'worship', NULL, 'uploads/gallery/1782506179_f7f4051a200063c5eeca208293c35acf.jpg', '2026-06-26 20:36:19', 8),
(536, 'IMG_0738', 'worship', NULL, 'uploads/gallery/1782506179_4c6484d127e71e58150b23176833b334.jpg', '2026-06-26 20:36:19', 8),
(537, 'IMG_0658 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_6536cbf1f6013f8bd78714b496dafc74.jpg', '2026-06-26 20:36:19', 8),
(538, 'IMG_0660 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_fb8328f02caba81207e24898feea88b6.jpg', '2026-06-26 20:36:19', 8),
(539, 'IMG_0663 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_df1111d98aac23efbb791da43d0d08b4.jpg', '2026-06-26 20:36:19', 8),
(540, 'IMG_0664 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_e4b24df52cd9f162e4192833f01a79ec.jpg', '2026-06-26 20:36:19', 8),
(541, 'IMG_0670 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_5f33d65fb2cb38ab4ffbc06aa5712809.jpg', '2026-06-26 20:36:19', 8),
(542, 'IMG_0671 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_b00e80b45073214efc916862efc2e10b.jpg', '2026-06-26 20:36:19', 8),
(543, 'IMG_0675 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_e1e558c9d1feea841bb258d05aab5408.jpg', '2026-06-26 20:36:19', 8),
(544, 'IMG_0680 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_e1f4960a9895c118f60bdfef68bde7cf.jpg', '2026-06-26 20:36:19', 8),
(545, 'IMG_0682 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_47e86360397054d6b0441c94d396c471.jpg', '2026-06-26 20:36:19', 8),
(546, 'IMG_0686 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_2bfa5feaeafe052f08562c067dfe763b.jpg', '2026-06-26 20:36:19', 8),
(547, 'IMG_0687 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_933661cde8da96f73aa807e8ab7735e3.jpg', '2026-06-26 20:36:19', 8),
(548, 'IMG_0688 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_b45041b0baa0683de91b79e23af9a749.jpg', '2026-06-26 20:36:19', 8),
(549, 'IMG_0689 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_d62821f676ecd21a746eb0c880b84b79.jpg', '2026-06-26 20:36:19', 8),
(550, 'IMG_0692 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_91b9c0cbbb5c1e0ace3f23ec112a4317.jpg', '2026-06-26 20:36:19', 8),
(551, 'IMG_0694 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_a23bcccf036a680f57f11b53637b709f.jpg', '2026-06-26 20:36:19', 8),
(552, 'IMG_0696 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_bb2b2f5a9b0023dd6827fa6d71652bf5.jpg', '2026-06-26 20:36:19', 8),
(553, 'IMG_0697 - Copy', 'worship', NULL, 'uploads/gallery/1782506179_f70b4cbc8c08f50bde2ee91b5e628f4c.jpg', '2026-06-26 20:36:19', 8),
(554, 'IMG_4794', 'worship', NULL, 'uploads/gallery/1782506384_6d65c486bddcf311e027354b521b7f64.jpg', '2026-06-26 20:39:44', 7),
(555, 'IMG_4795', 'worship', NULL, 'uploads/gallery/1782506384_9c1adcbf7477ab5018181d3177479e1a.jpg', '2026-06-26 20:39:44', 7),
(556, 'IMG_4796', 'worship', NULL, 'uploads/gallery/1782506384_1cf47a15dabc0c91610af55f8d644373.jpg', '2026-06-26 20:39:44', 7),
(557, 'IMG_4797', 'worship', NULL, 'uploads/gallery/1782506384_a060920b0025d61d1c98e80ec3ee4b77.jpg', '2026-06-26 20:39:44', 7),
(558, 'IMG_4798', 'worship', NULL, 'uploads/gallery/1782506384_30f1c6a14beaca4662c9d781edb6625e.jpg', '2026-06-26 20:39:44', 7),
(559, 'IMG_4799', 'worship', NULL, 'uploads/gallery/1782506384_88aff6954b88d72c672827f0aab21625.jpg', '2026-06-26 20:39:44', 7),
(560, 'IMG_4800', 'worship', NULL, 'uploads/gallery/1782506384_8c12fec0d9150c1c3ba3bd7403849e58.jpg', '2026-06-26 20:39:44', 7),
(561, 'IMG_4801', 'worship', NULL, 'uploads/gallery/1782506384_e66d180ab06edac01d7f2277c694084f.jpg', '2026-06-26 20:39:44', 7),
(562, 'IMG_4802', 'worship', NULL, 'uploads/gallery/1782506384_2c065f5a37a184c4d31950d2298cb569.jpg', '2026-06-26 20:39:44', 7),
(563, 'IMG_4803', 'worship', NULL, 'uploads/gallery/1782506384_d2ccdf37fd2bcb98a7339d5ef2ea80ba.jpg', '2026-06-26 20:39:44', 7),
(564, 'IMG_4804', 'worship', NULL, 'uploads/gallery/1782506384_e631bc94aa20260746d4e8d94bd105d5.jpg', '2026-06-26 20:39:44', 7),
(565, 'IMG_4810', 'worship', NULL, 'uploads/gallery/1782506384_d7edf91c727287cfd355458da53c2ba4.jpg', '2026-06-26 20:39:44', 7),
(566, 'IMG_4811', 'worship', NULL, 'uploads/gallery/1782506384_cc6ab0a5e8f84389e1fe80071c647ff8.jpg', '2026-06-26 20:39:44', 7),
(567, 'IMG_4812', 'worship', NULL, 'uploads/gallery/1782506384_724a82acb57376685c44085fd6a1a634.jpg', '2026-06-26 20:39:44', 7),
(568, 'IMG_4814', 'worship', NULL, 'uploads/gallery/1782506384_1992c8060f01e7822b39604f5c210035.jpg', '2026-06-26 20:39:44', 7),
(569, 'IMG_4793', 'worship', NULL, 'uploads/gallery/1782506384_def006b4200bf29cd8f62ff41be8e290.jpg', '2026-06-26 20:39:44', 7),
(570, 'CKAY9028', 'worship', NULL, 'uploads/gallery/1782506495_895935ac84d50a1d1eb60ec0cbb492c4.jpg', '2026-06-26 20:41:35', 7),
(571, 'IMG_4766', 'worship', NULL, 'uploads/gallery/1782506495_4747fd2300b8aee4bf57ebc9a3796509.jpg', '2026-06-26 20:41:35', 7),
(572, 'IMG_4767', 'worship', NULL, 'uploads/gallery/1782506495_8b22597b15f955a0f4e832b8d1dff643.jpg', '2026-06-26 20:41:35', 7),
(573, 'IMG_4768', 'worship', NULL, 'uploads/gallery/1782506495_b1a8be734a6b93e8967fadf648ebc953.jpg', '2026-06-26 20:41:35', 7),
(574, 'IMG_4770', 'worship', NULL, 'uploads/gallery/1782506495_167b2cacaca72050c96a497a7a3eb1fc.jpg', '2026-06-26 20:41:35', 7),
(575, 'IMG_4771', 'worship', NULL, 'uploads/gallery/1782506495_82d4c89c704ffa4dedb08603367e10d2.jpg', '2026-06-26 20:41:35', 7),
(576, 'IMG_4772', 'worship', NULL, 'uploads/gallery/1782506495_c58ec1c3f1aabd1005b2473aebc53f62.jpg', '2026-06-26 20:41:35', 7),
(577, 'IMG_4775', 'worship', NULL, 'uploads/gallery/1782506495_57b9f7fc21f4258fe153b257029205b1.jpg', '2026-06-26 20:41:35', 7),
(578, 'IMG_4778', 'worship', NULL, 'uploads/gallery/1782506495_6c3fcd87c15fcdaa6641b6af597bb742.jpg', '2026-06-26 20:41:35', 7),
(579, 'IMG_4786', 'worship', NULL, 'uploads/gallery/1782506495_d38e3a3823790d0e9b2619f018a27599.jpg', '2026-06-26 20:41:35', 7),
(580, 'IMG_4787', 'worship', NULL, 'uploads/gallery/1782506495_63caf67440035ea2393cd8087b0c1ec9.jpg', '2026-06-26 20:41:35', 7),
(581, 'IMG_4788', 'worship', NULL, 'uploads/gallery/1782506495_f61a82848138fe136fd8e32e6f8770b7.jpg', '2026-06-26 20:41:35', 7),
(582, 'IMG_4789', 'worship', NULL, 'uploads/gallery/1782506495_e075e61e070fd5936593666fb61bf713.jpg', '2026-06-26 20:41:35', 7),
(583, 'IMG_4790', 'worship', NULL, 'uploads/gallery/1782506495_dff004f3f3536e5fa471c7ff9992d6b3.jpg', '2026-06-26 20:41:35', 7),
(584, 'IMG_4791', 'worship', NULL, 'uploads/gallery/1782506495_5be506a2e789c47e773a976a09a5a3ad.jpg', '2026-06-26 20:41:35', 7),
(585, 'CKAY9026', 'worship', NULL, 'uploads/gallery/1782506681_abf0b1b1e93954fe7a648346ac92d64b.jpg', '2026-06-26 20:44:41', 7),
(586, 'CKAY9027', 'worship', NULL, 'uploads/gallery/1782506681_18ad9fb78686b87cfbdcc9bf06863769.jpg', '2026-06-26 20:44:41', 7),
(587, 'CKAY8737', 'worship', NULL, 'uploads/gallery/1782506681_7ffc8d79b1becb6674930b254acecea2.jpg', '2026-06-26 20:44:41', 7),
(588, 'CKAY8738', 'worship', NULL, 'uploads/gallery/1782506681_74969f9ab7803e5944c19231ccdf0ea7.jpg', '2026-06-26 20:44:41', 7),
(589, 'CKAY8740', 'worship', NULL, 'uploads/gallery/1782506681_3e46d7e27e5ab3c7d72abb4bf4da8200.jpg', '2026-06-26 20:44:41', 7),
(590, 'CKAY8743', 'worship', NULL, 'uploads/gallery/1782506681_6af51a4edfd354dd3ccff0027d9ac770.jpg', '2026-06-26 20:44:41', 7),
(591, 'CKAY8745', 'worship', NULL, 'uploads/gallery/1782506681_65faa65f5de8e87d36035c9594583b81.jpg', '2026-06-26 20:44:41', 7),
(592, 'CKAY8746', 'worship', NULL, 'uploads/gallery/1782506681_1ff1eabfc6c7cf86d4981cf69985a23d.jpg', '2026-06-26 20:44:41', 7),
(593, 'CKAY8747', 'worship', NULL, 'uploads/gallery/1782506681_ddf7484db5250ffe2a56da3c5cf8d0b7.jpg', '2026-06-26 20:44:41', 7),
(594, 'CKAY8748', 'worship', NULL, 'uploads/gallery/1782506681_290abf08a5e5a39c525693bfd8a3b651.jpg', '2026-06-26 20:44:41', 7),
(595, 'CKAY8992', 'worship', NULL, 'uploads/gallery/1782506681_fc52053b39e9ae153e6269289e7ed666.jpg', '2026-06-26 20:44:41', 7),
(596, 'CKAY8994', 'worship', NULL, 'uploads/gallery/1782506681_6a3903bdefa0b10e30b1bd6ba60a9500.jpg', '2026-06-26 20:44:41', 7),
(597, 'CKAY8995', 'worship', NULL, 'uploads/gallery/1782506681_3b2234d230f5259e1e6e8f9c5607b927.jpg', '2026-06-26 20:44:41', 7),
(598, 'CKAY8996', 'worship', NULL, 'uploads/gallery/1782506681_0b967c302b64564510c7e477404e94a7.jpg', '2026-06-26 20:44:41', 7),
(599, 'CKAY8999', 'worship', NULL, 'uploads/gallery/1782506681_f9760f362515d71910de4b4e328801ee.jpg', '2026-06-26 20:44:41', 7),
(600, 'CKAY9000', 'worship', NULL, 'uploads/gallery/1782506681_c2f2a3506babb8711f1152d21e1bd8e7.jpg', '2026-06-26 20:44:41', 7),
(601, 'CKAY9001', 'worship', NULL, 'uploads/gallery/1782506681_f3112fe06ba29b6f1dca70fdb82292c1.jpg', '2026-06-26 20:44:41', 7),
(602, 'CKAY9002', 'worship', NULL, 'uploads/gallery/1782506681_c6ad61888078c52bd4e9acc0668b58e9.jpg', '2026-06-26 20:44:41', 7),
(603, 'CKAY9003', 'worship', NULL, 'uploads/gallery/1782506681_18bca8fec57ead853693628a4de01707.jpg', '2026-06-26 20:44:41', 7),
(604, 'CKAY9006', 'worship', NULL, 'uploads/gallery/1782506681_9d4d7509089cd5ffab4abf106688046c.jpg', '2026-06-26 20:44:41', 7),
(605, 'IMG_0040', 'worship', NULL, 'uploads/gallery/1782506870_e6ac573c71ac3e43a01b92248d8e4970.jpg', '2026-06-26 20:47:50', 7),
(606, 'IMG_0042', 'worship', NULL, 'uploads/gallery/1782506870_f08c5d01324e719b5c6488d8d891f716.jpg', '2026-06-26 20:47:50', 7),
(607, 'IMG_0045', 'worship', NULL, 'uploads/gallery/1782506870_1d790d704dc88a5be703040ccba0b817.jpg', '2026-06-26 20:47:50', 7),
(608, 'IMG_0046', 'worship', NULL, 'uploads/gallery/1782506870_dee925ec7adfb66910201979d329561d.jpg', '2026-06-26 20:47:50', 7),
(609, 'IMG_0015', 'worship', NULL, 'uploads/gallery/1782506870_66df1bf927f8a6327a720e39d469fabd.jpg', '2026-06-26 20:47:50', 7),
(610, 'IMG_0018', 'worship', NULL, 'uploads/gallery/1782506870_339337172aa963b793d53aa5d05a0ccf.jpg', '2026-06-26 20:47:50', 7),
(611, 'IMG_0019', 'worship', NULL, 'uploads/gallery/1782506870_dcbd4b9cb5e7d16e296f4fbe4c0a467d.jpg', '2026-06-26 20:47:50', 7),
(612, 'IMG_0020', 'worship', NULL, 'uploads/gallery/1782506870_40569cdda128f7601c9158d3ef2d72c9.jpg', '2026-06-26 20:47:50', 7),
(613, 'IMG_0022', 'worship', NULL, 'uploads/gallery/1782506870_b5bbd6ceb6b4c1edb371943902c9d93d.jpg', '2026-06-26 20:47:50', 7),
(614, 'IMG_0023', 'worship', NULL, 'uploads/gallery/1782506870_a833b99bee188a45cef717a4cd49f595.jpg', '2026-06-26 20:47:50', 7),
(615, 'IMG_0024', 'worship', NULL, 'uploads/gallery/1782506870_0da4dd514fb9b4cc44a8875b2df350f7.jpg', '2026-06-26 20:47:50', 7),
(616, 'IMG_0025', 'worship', NULL, 'uploads/gallery/1782506870_95dbb9827d8fdf093a6113d6d52027c3.jpg', '2026-06-26 20:47:50', 7),
(617, 'IMG_0027', 'worship', NULL, 'uploads/gallery/1782506870_9f96c7e953b1053b13bc751001605f64.jpg', '2026-06-26 20:47:50', 7),
(618, 'IMG_0028', 'worship', NULL, 'uploads/gallery/1782506870_393420816eb47c76461d78d4715352b5.jpg', '2026-06-26 20:47:50', 7),
(619, 'IMG_0029', 'worship', NULL, 'uploads/gallery/1782506870_182faf82211d78710d6d168d3b788522.jpg', '2026-06-26 20:47:50', 7),
(620, 'IMG_0034', 'worship', NULL, 'uploads/gallery/1782506870_33844b9e47b10393df5b7f697abceccc.jpg', '2026-06-26 20:47:50', 7),
(621, 'IMG_0035', 'worship', NULL, 'uploads/gallery/1782506870_71b3bbaf238a0eba2df858bf715f024b.jpg', '2026-06-26 20:47:50', 7),
(622, 'IMG_0036', 'worship', NULL, 'uploads/gallery/1782506870_b9dd86fc7b38d6d1e779ba5712704b0b.jpg', '2026-06-26 20:47:50', 7),
(623, 'IMG_0038', 'worship', NULL, 'uploads/gallery/1782506870_d2f17dadcf6d9156beff6c63f292fec7.jpg', '2026-06-26 20:47:50', 7),
(624, 'IMG_0039', 'worship', NULL, 'uploads/gallery/1782506870_d6f61025cece05c720e4c651a9f79c43.jpg', '2026-06-26 20:47:50', 7),
(625, 'IMG_9454', 'worship', NULL, 'uploads/gallery/1782507018_932c68930cff2fec8b8971467900694d.jpg', '2026-06-26 20:50:18', 7),
(626, 'IMG_9457', 'worship', NULL, 'uploads/gallery/1782507018_53cff134055a5688ec5ddf29899e42a6.jpg', '2026-06-26 20:50:18', 7),
(627, 'IMG_0131', 'worship', NULL, 'uploads/gallery/1782507018_6e5f37e729ae9bcca4a8b955d18b34d2.jpg', '2026-06-26 20:50:18', 7),
(628, 'IMG_0152', 'worship', NULL, 'uploads/gallery/1782507018_434af165e491946d2576f3936c554730.jpg', '2026-06-26 20:50:18', 7),
(629, 'IMG_0162', 'worship', NULL, 'uploads/gallery/1782507018_f4d2c040b0ec8873bff9fc2172b9b03e.jpg', '2026-06-26 20:50:18', 7),
(630, 'IMG_0167', 'worship', NULL, 'uploads/gallery/1782507018_d3070cafc43b03bfa3451d6376edf99d.jpg', '2026-06-26 20:50:18', 7),
(631, 'IMG_0172', 'worship', NULL, 'uploads/gallery/1782507018_dc2e2abcecff6cd9ffb747413666de3e.jpg', '2026-06-26 20:50:18', 7),
(632, 'IMG_0174', 'worship', NULL, 'uploads/gallery/1782507018_24101142038553eadad47f214a8ad136.jpg', '2026-06-26 20:50:18', 7),
(633, 'IMG_0178', 'worship', NULL, 'uploads/gallery/1782507018_e00e4f2fd1808ad5d327839e87f258ee.jpg', '2026-06-26 20:50:18', 7),
(634, 'IMG_0180', 'worship', NULL, 'uploads/gallery/1782507018_ac01b9026768729a371d6164485874be.jpg', '2026-06-26 20:50:18', 7),
(635, 'IMG_0184', 'worship', NULL, 'uploads/gallery/1782507018_a08edd7b840453dd4d8fc743d04d9e21.jpg', '2026-06-26 20:50:18', 7),
(636, 'IMG_0187', 'worship', NULL, 'uploads/gallery/1782507018_f6609f9d15e29616f633b2dd1261edd1.jpg', '2026-06-26 20:50:18', 7),
(637, 'IMG_0195', 'worship', NULL, 'uploads/gallery/1782507018_b3f3cbc0349ece2a97e04e155c17d81a.jpg', '2026-06-26 20:50:18', 7),
(638, 'IMG_0198', 'worship', NULL, 'uploads/gallery/1782507018_ec14c7d7c1c8af03eb17277a72d65c5b.jpg', '2026-06-26 20:50:18', 7),
(639, 'IMG_9398', 'worship', NULL, 'uploads/gallery/1782507018_a14eb747a6699c9239e965fa352afb5c.jpg', '2026-06-26 20:50:18', 7),
(640, 'IMG_9430', 'worship', NULL, 'uploads/gallery/1782507018_958490e49cfe5746e0128c8d5f14ea20.jpg', '2026-06-26 20:50:18', 7),
(641, 'IMG_9435', 'worship', NULL, 'uploads/gallery/1782507018_7cf5371ed18ce4120338db0f7bd854a4.jpg', '2026-06-26 20:50:18', 7),
(642, 'IMG_9440', 'worship', NULL, 'uploads/gallery/1782507018_7c57adfd0a77271c2b999b4c1a262d05.jpg', '2026-06-26 20:50:18', 7),
(643, 'IMG_9443', 'worship', NULL, 'uploads/gallery/1782507018_cf42ffc934de01813be80f1190dce978.jpg', '2026-06-26 20:50:18', 7),
(644, 'IMG_9451', 'worship', NULL, 'uploads/gallery/1782507018_86298dbffcef14e969c6b5e8ce4a5adb.jpg', '2026-06-26 20:50:18', 7),
(645, 'IMG_9501', 'worship', NULL, 'uploads/gallery/1782507112_283ab475a0dc992193e4e63d4b9c9bea.jpg', '2026-06-26 20:51:52', 7),
(646, 'IMG_9502', 'worship', NULL, 'uploads/gallery/1782507112_f09689d1898c4de52f71be8e390ce08c.jpg', '2026-06-26 20:51:52', 7),
(647, 'IMG_9503', 'worship', NULL, 'uploads/gallery/1782507112_8c4660a979901a9d5678e2b8027ebc01.jpg', '2026-06-26 20:51:52', 7),
(648, 'IMG_9505', 'worship', NULL, 'uploads/gallery/1782507112_b0ae3f6c1204d6d3c1a812ef7f83df35.jpg', '2026-06-26 20:51:52', 7),
(649, 'IMG_9462', 'worship', NULL, 'uploads/gallery/1782507112_6db7c5abb9fe6238003a65cc3a18a886.jpg', '2026-06-26 20:51:52', 7),
(650, 'IMG_9465', 'worship', NULL, 'uploads/gallery/1782507112_b475aa6f47352ceee12225a9a71a8385.jpg', '2026-06-26 20:51:52', 7),
(651, 'IMG_9466', 'worship', NULL, 'uploads/gallery/1782507112_ce26112879c41ee576c427ab045a5d02.jpg', '2026-06-26 20:51:52', 7),
(652, 'IMG_9468', 'worship', NULL, 'uploads/gallery/1782507112_de28b21167c993f8e2bd28860de46648.jpg', '2026-06-26 20:51:52', 7),
(653, 'IMG_9470', 'worship', NULL, 'uploads/gallery/1782507112_4567bbfb3d0614fa1b1049577b029b8a.jpg', '2026-06-26 20:51:52', 7),
(654, 'IMG_9471', 'worship', NULL, 'uploads/gallery/1782507112_488415caf430882235027e43775acfbb.jpg', '2026-06-26 20:51:52', 7),
(655, 'IMG_9472', 'worship', NULL, 'uploads/gallery/1782507112_0aba54807f2efe1c2200c8fa9ea77527.jpg', '2026-06-26 20:51:52', 7),
(656, 'IMG_9474', 'worship', NULL, 'uploads/gallery/1782507112_3d8c9125f941674167fdf16d818653be.jpg', '2026-06-26 20:51:52', 7),
(657, 'IMG_9475', 'worship', NULL, 'uploads/gallery/1782507112_8c6c80ee4aa7f54ce5199d5acc8466e1.jpg', '2026-06-26 20:51:52', 7),
(658, 'IMG_9483', 'worship', NULL, 'uploads/gallery/1782507112_19a6f197f325287e5f94d6e0397b182e.jpg', '2026-06-26 20:51:52', 7),
(659, 'IMG_9488', 'worship', NULL, 'uploads/gallery/1782507112_c5d670cb1246a85cee64a99e01a3b58c.jpg', '2026-06-26 20:51:52', 7),
(660, 'IMG_9493', 'worship', NULL, 'uploads/gallery/1782507112_6efd92621642b8960aad1313cdcd8807.jpg', '2026-06-26 20:51:52', 7),
(661, 'IMG_9494', 'worship', NULL, 'uploads/gallery/1782507112_19477a0b1d6fe048d88e55166dbbb313.jpg', '2026-06-26 20:51:52', 7),
(662, 'IMG_9495', 'worship', NULL, 'uploads/gallery/1782507112_3df89c6a28ff305bf5f12d1436708da0.jpg', '2026-06-26 20:51:52', 7),
(663, 'IMG_9498', 'worship', NULL, 'uploads/gallery/1782507112_fc5543e6e9d72eaa9f6010a2ef4a05c7.jpg', '2026-06-26 20:51:52', 7),
(664, 'IMG_9499', 'worship', NULL, 'uploads/gallery/1782507112_f100cf993066f0b199dc590f1929e166.jpg', '2026-06-26 20:51:52', 7),
(665, 'IMG_9530', 'worship', NULL, 'uploads/gallery/1782507379_d118184dcb1b1c5b3e451db4985acbbb.jpg', '2026-06-26 20:56:19', 7),
(666, 'IMG_9532', 'worship', NULL, 'uploads/gallery/1782507379_d7046f1cef51b4784db955e8db649aef.jpg', '2026-06-26 20:56:19', 7),
(667, 'IMG_9533', 'worship', NULL, 'uploads/gallery/1782507379_16577aa27e85d8aee584ed4cbce9acf3.jpg', '2026-06-26 20:56:19', 7),
(668, 'IMG_9534', 'worship', NULL, 'uploads/gallery/1782507379_f13755aa844204d3b932736ca7c7fe6d.jpg', '2026-06-26 20:56:19', 7),
(669, 'IMG_9537', 'worship', NULL, 'uploads/gallery/1782507379_0cd2c3e64407ab5e8f1782bd808eb82d.jpg', '2026-06-26 20:56:19', 7),
(670, 'IMG_9539', 'worship', NULL, 'uploads/gallery/1782507379_eb8f353138df342cad1b4a43993c3016.jpg', '2026-06-26 20:56:19', 7),
(671, 'IMG_9540', 'worship', NULL, 'uploads/gallery/1782507379_ce18b0d81d7211026a3b1b0efed48fcc.jpg', '2026-06-26 20:56:19', 7),
(672, 'IMG_9541', 'worship', NULL, 'uploads/gallery/1782507379_0341b17db94d5e7d5bda5bfe973aeedc.jpg', '2026-06-26 20:56:19', 7),
(673, 'IMG_9493', 'worship', NULL, 'uploads/gallery/1782507379_6141fb45051ebeb973e6a044473c3646.jpg', '2026-06-26 20:56:19', 7),
(674, 'IMG_9505', 'worship', NULL, 'uploads/gallery/1782507379_39561c2ecf0f2697968e51a8e1b1370c.jpg', '2026-06-26 20:56:19', 7),
(675, 'IMG_9506', 'worship', NULL, 'uploads/gallery/1782507379_3a5741e97db54e5a1bdef28382b50883.jpg', '2026-06-26 20:56:19', 7),
(676, 'IMG_9508', 'worship', NULL, 'uploads/gallery/1782507379_d71f90d1ac58d13fc86bfbbe1b6fbf8b.jpg', '2026-06-26 20:56:19', 7),
(677, 'IMG_9512', 'worship', NULL, 'uploads/gallery/1782507379_4da8845c0de0c518823faa014e427648.jpg', '2026-06-26 20:56:19', 7),
(678, 'IMG_9513', 'worship', NULL, 'uploads/gallery/1782507379_bc47b538ad852f57bd2f78bf4da8a15e.jpg', '2026-06-26 20:56:19', 7),
(679, 'IMG_9516', 'worship', NULL, 'uploads/gallery/1782507379_a6437ebb564aefe3e16fae7b323a7292.jpg', '2026-06-26 20:56:19', 7),
(680, 'IMG_9521', 'worship', NULL, 'uploads/gallery/1782507379_346b0b360ecf712842844e2c35408e84.jpg', '2026-06-26 20:56:19', 7),
(681, 'IMG_9522', 'worship', NULL, 'uploads/gallery/1782507379_6a48d94e2364ef9f5a5b03bc70b4388c.jpg', '2026-06-26 20:56:19', 7),
(682, 'IMG_9525', 'worship', NULL, 'uploads/gallery/1782507379_54c887a54754ec83d60e9650bf6a3ebd.jpg', '2026-06-26 20:56:19', 7),
(683, 'IMG_9527', 'worship', NULL, 'uploads/gallery/1782507379_38a02470990a032d9f0750f1452d7895.jpg', '2026-06-26 20:56:19', 7),
(684, 'IMG_9528', 'worship', NULL, 'uploads/gallery/1782507379_fa35add64735ff643639284fb991abe2.jpg', '2026-06-26 20:56:19', 7);

-- --------------------------------------------------------

--
-- Table structure for table `hero_slider`
--

CREATE TABLE `hero_slider` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `hero_slider`
--

INSERT INTO `hero_slider` (`id`, `title`, `image_url`, `display_order`, `is_active`, `created_at`) VALUES
(1, '', 'uploads/hero/1776469975_ban.jpg', 0, 1, '2026-04-16 07:44:27'),
(2, '', 'uploads/hero/1776470000_about.jpg', 0, 1, '2026-04-16 07:44:43'),
(3, '', 'uploads/hero/1776470310_banna.jpg', 0, 1, '2026-04-16 07:45:24');

-- --------------------------------------------------------

--
-- Table structure for table `home_settings`
--

CREATE TABLE `home_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `home_settings`
--

INSERT INTO `home_settings` (`id`, `setting_key`, `setting_value`, `setting_label`, `updated_at`) VALUES
(1, 'hero_title', 'Christ In You !!', 'Hero Title', '2026-04-15 19:10:04'),
(2, 'hero_subtitle', 'The Hope Of Glory', 'Hero Subtitle', '2026-04-15 19:10:04'),
(3, 'hero_tagline', '🔥 Raising firebrands for Christ at Takoradi Technical University', 'Hero Tagline', '2026-04-15 12:21:57'),
(4, 'hero_background', 'uploads/home/1776261206_lcc.jpeg', 'Hero Background Image', '2026-04-15 13:53:26'),
(5, 'about_title', 'About PENSA TTU', 'About Title', '2026-04-15 12:21:57'),
(6, 'about_text', 'The Pentecost Students and Associates (PENSA), the student wing of the Church of Pentecost worldwide, began over forty (50) years ago with a few dedicated students in tertiary institutions across Ghana. Over the years, it has grown into a vibrant and impactful movement, drawing young men and women to the saving grace of our Lord Jesus Christ.\r\n\r\nAt PENSA TTU – Takoradi Technical University, this vision continues to thrive as a dynamic fellowship committed to spiritual growth, discipleship, and evangelism on campus. The fellowship serves as a strong platform for students to deepen their relationship with God, build Christ-centered character, and influence their academic and social environments with godly values.\r\n\r\n', 'About Text', '2026-04-17 15:38:46'),
(7, 'about_image', 'uploads/home/1776261220_pensa.jpg', 'About Image', '2026-04-15 13:53:40'),
(8, 'stat_members', '600+', 'Active Members Stat', '2026-04-15 12:21:57'),
(9, 'stat_fellowships', '8+', 'Weekly Fellowships Stat', '2026-04-15 12:21:57'),
(10, 'stat_campuses', '3', 'Campuses Stat', '2026-04-15 12:21:57');

-- --------------------------------------------------------

--
-- Table structure for table `leadership`
--

CREATE TABLE `leadership` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `category` varchar(50) DEFAULT 'ec',
  `academic_year` varchar(20) NOT NULL DEFAULT '2024/2025',
  `description` text DEFAULT NULL,
  `programme` varchar(255) DEFAULT NULL,
  `hall` varchar(255) DEFAULT NULL,
  `previous_portfolio` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leadership`
--

INSERT INTO `leadership` (`id`, `name`, `role`, `category`, `academic_year`, `description`, `programme`, `hall`, `previous_portfolio`, `image_url`, `display_order`, `is_active`) VALUES
(1, 'Pastor John and Mrs. Essah', 'Traveling Secretary', 'pastor', 'N/A', 'Traveling Secretary For The Takoradi Sector', 'N/A', 'N/A', 'N/A', 'uploads/leadership/1776470718_pastor.jpg', 0, 1),
(2, 'Elder Ebenezer Omano', 'Evangelism Secretory ', 'ec', '2025/2026', '', 'B.Tech Plumbing Technology', 'Nzema Hall', 'Schools Coordinator ', 'uploads/leadership/1779014616_b9bf9964-9f6e-47de-a01e-27e286fe2a88.jpeg', 4, 1),
(3, 'Deaconess Judith Maade Kuwornu', 'Secretary ', 'ec', '2025/2026', '', 'B.Tech Medical Laboratory Science', 'Off-Campus', 'Secretary 2024/2025', 'uploads/leadership/1782507631_IMG_9867.jpg', 3, 1),
(4, 'Affum Emmanuella Comfort Anane', 'Vice President ', 'ec', '2025/2026', '', 'B.Tech Marketing', 'Off-Campus', 'Getfund Hall Rep, Financial Secretary(2023 - 2025)', 'uploads/leadership/1779017741_IMG_2439.jpeg', 2, 1),
(5, 'Adu Yaw Ebenezer', 'Music and Drama Director', 'lcc', '2025/2026', 'My journey through Pensa TTU has been nothing short of grace and revival and I pray that the Lord lifts the institution to the highest level of empowerment', 'B.Tech Information Technology', 'Off-Campus', 'Heavenly Bells Organizer ', 'uploads/leadership/1779317826_941fcc35-5747-46b8-a1d4-3d9a1397dbf7.jpeg', 15, 1),
(6, 'Solomon Gakpo', 'Technical Head', 'lcc', '2025/2026', '', 'B.Tech Electrical/Electronics Engineering', 'Off-Campus', 'None', 'uploads/leadership/1779318736_4335abfd-98f3-4c4f-abd7-8bda180396b2.jpeg', 15, 1),
(7, 'Awuah Augustine', 'Ushering and protocol head', 'lcc', '2025/2026', '', 'Other', 'Nzema Hall', '', 'uploads/leadership/1779318971_Screenshot_20260302_081006_Phoenix.jpg', 17, 1),
(8, 'Deacon Emmanuel Bonsu Asomeah Junior', 'Assistant Evangelism Secretary and Assistant Gent Wing Coordinator', 'lcc', '2025/2026', 'To continuously make Pensa TTU be one of the best denominations on campus', 'Other', 'Getfund Hall', 'None', 'uploads/leadership/1779319048_9D33AD03-0D3D-46C8-B4F8-43A130553155.jpeg', 18, 1),
(9, 'Kingsley Boakye Dankwa', 'Special Needs Coordinator', 'lcc', '2025/2026', 'Very passionate about the things of God. The ultimate goal is to win a billion soul for Jesus - it\\\'s possible.', '', 'Ahanta Hall', 'Assistant Schools Coordinator ( 2024/2025)', 'uploads/leadership/1779319120_Snapchat-1982812530.jpg', 17, 1),
(10, 'Dcn. Joseph Blankson-Ocran', 'Deputy Schools Coordinator', 'lcc', '2025/2026', 'I’m a dedicated young guy with the aim of compelling more people for God', 'B.Tech Civil Engineering', 'Off-Campus', '', 'uploads/leadership/1779342453_IMG-20260222-WA0118.jpeg', 15, 1),
(11, 'Dn Bismark Ayiku', 'Schools coordinator', 'lcc', '2025/2026', 'PENSA TTU will become one of the best denominations on campus and also see to the spiritual growth of its members.', 'B.Tech Electrical/Electronics Engineering', 'Ahanta Hall', 'MPWDs coordinator, Child evangelism coordinator', 'uploads/leadership/1779347400_IMG-20250923-WA00411.jpg', 9, 1),
(12, 'Eunice Nyameye Adusu', 'Professional Guild Coordinator', 'lcc', '2025/2026', '', 'Other', 'Getfund Hall', 'Assistant Ushering and Protocol ', 'uploads/leadership/1779351994_9633.jpg', 7, 1),
(14, 'David Boadu-Dwamena', 'Alumni Coordinator', 'lcc', '2025/2026', '', 'B.Tech Information Technology', 'Off-Campus', 'Alumni Coordinator(2023/2024),(2024/2025)', 'uploads/leadership/1781622556_IMG_1478.jpeg', 6, 1),
(15, 'Isaac Esssandoh', 'Gent wing coordinator', 'lcc', '2025/2026', 'Lord mercies endure forever for those  who passionately wait upon him', 'B.Tech Information Technology', 'Nzema Hall', 'None', 'uploads/leadership/1779452622_cd107275-9bdf-46c3-9a39-c48f9c432f3a.jpeg', 10, 1),
(16, 'Godfred Osei', 'Windy Ridge overseer', 'lcc', '2025/2026', '', 'Other', 'Ahanta Hall', 'Windy ridge overseer', 'uploads/leadership/1779456984_IMG_1195.jpeg', 19, 1),
(17, 'Aziz Asare', 'Assistant Prayer secretary', 'lcc', '2025/2026', 'My name is Aziz Asare, a student of Secretaryship and Management studies, and an entrepreneur. \\r\\n\\r\\nI started as a common Member of Pensa (TTU),  later I was appointed as a Prayer Commandant to support the Assistant Prayer Secretary at the BU campus (2024/2025). In my final year(2025/2026), I was elected as the Assistant Prayer Secretary for Pensa (TTU) where I was stationed at the BU campus helping the work of God, and volunteering as the Publicity head at the BU campus since there was no one doing it. I took about 4 members grooming them to take over the Prayer Department when we are off campus.\\r\\n\\r\\n Serving in Pensa has been a blessing and a growing platform for my entire life. God bless Pensa for preparing us to face the world and its challenges', 'Other', 'Getfund Hall', 'Prayer Commandant BU (204/2025)', 'uploads/leadership/1779473398_C7860CCA-1821-4153-8D3B-8A3E314460A9.jpeg', 13, 1),
(18, 'NARH KINGSLEY', 'HALL REPRESENTATIVE', 'lcc', '2025/2026', 'Narh Kingsley is an Electrical Engineering Student at Takoradi Technical University and a dedicated student leader. Serving as a Hall Representative, I passionately advocates for the Welfare of members of Pensa TTU. With a strong focus on the well being of the members and the community at large, I am committed to driving positive change across campus and empower my peers to create an atmosphere of peace and stability.', 'B.Tech Electrical/Electronics Engineering', 'Off-Campus', 'NONE ', 'uploads/leadership/1779965675_IMG-20260104-WA0011.jpg', 20, 1),
(19, 'Janin Ishmael', 'Drama Director', 'lcc', '2025/2026', 'I\\\'m in the person of Ishmael Janin a student  of Takoradi Technical University offering Electrical and Electronics Engineering.\\r\\nThe current Drama Director for Pensa-TTU, I\\\'m passionate about preaching the Gospel through Drama and Choreography to inspire lives, and glorify God through impactful ministrations.', 'B.Tech Electrical/Electronics Engineering', 'Off-Campus', 'NONE ', 'uploads/leadership/1780685479_file_0000000046f87230b05a40874c3f9097.png', 12, 1),
(20, 'Dcn.Kwabena Gideon', 'Hall representative', 'lcc', '2025/2026', 'Kwabena Gideon is the Nzema Mensah Hall Representative. He serves as a dedicated leader and a reliable voice for hall residents, working closely with the student administration to improve student welfare and build a strong hall community.', 'B.Tech Electrical/Electronics Engineering', 'Nzema Hall', 'None', 'uploads/leadership/1782069224_b9cac58c-69eb-4cbc-9f8f-f50d79fe1f37.jpeg', 15, 1),
(21, 'Nathan  E. Arvoh', 'Child Evangelism', 'lcc', '2025/2026', 'I\\\'m Dedicated  to serving God and impacting lives at PENSA TTU. Committed to excellence and spiritual growth', 'B.Tech Information Technology', 'Off-Campus', 'NONE ', 'uploads/leadership/1780787884_1001733998.jpg', 16, 1),
(23, 'Dcn Joseph Mensah Sackey', 'PUBLICITY HEAD', 'lcc', '2025/2026', 'I\\\'m Dcn. Joseph Mensah Sackey was born in Otsew Jukwa in the central region to Elder Samuel Yaw Sackey and Dcns. Ekua Akoto\\r\\n\\r\\nVision on PENSA TTU.: To see PENSA TTU, growing mightily in everything.', 'B.Tech Electrical/Electronics Engineering', 'Nzema Hall', 'UNIVERSITY HALL REP', 'uploads/leadership/1781381893_1001175564.jpg', 18, 1),
(24, 'lsaac sarkodie mensah', 'ASSISTANT TECHNICAL HAND', 'lcc', '2025/2026', 'I am a dedicated and enthusiastic student of Takoradi Technical University (TTU) with a passion for personal growth, leadership, and service to God. My journey in PENSA has strengthened my faith, helped me build meaningful relationships, and inspired me to live a life of purpose and integrity. My vision is to positively impact my campus and community through Christian leadership, humility, and excellence. I am passionate about supporting others spiritually, encouraging fellowship among students, and contributing to the growth of PENSA TTU.', 'Other', 'University Hall', 'ASSISTANT TECHNICAL HAND (2025To 2026', 'uploads/leadership/1781430571_IMG-20260613-WA00322.jpg', 19, 1),
(25, 'Dcns. Dorcas Cobbinah', 'Assistant ladies Wing Coordinator', 'lcc', '2025/2026', 'Looking forward that in the next 3 to 4 years PENSA TTU will have a Campus Pastor', 'Other', 'Off-Campus', 'Akalima Overseer \\r\\nAssistant ladies wing Coordinator ', 'uploads/leadership/1785442431_IMG_4219.jpeg', 20, 1),
(26, 'Deacon Emmanuel Asomeah Bonsu Senior', 'Assistant Alumni Coordinator ', 'lcc', '2025/2026', '', 'B.Tech Electrical/Electronics Engineering', 'Ahanta Hall', '', 'uploads/leadership/1781631268_IMG_3128.jpeg', 9, 1),
(27, 'Emmanuella Johnson', 'Ass. Ladies Wings Coordinator ', 'lcc', '2025/2026', '', 'B.Tech Secretaryship & Management Studies', 'Getfund Hall', 'Ass. Secretary(2024/2025)', 'uploads/leadership/1782428442_IMG_2481.jpeg', 10, 1),
(28, 'Emmanuel Ampomah obeng', 'PEMOSCA', 'lcc', '2025/2026', 'There is always joy doing this that involve God because He is our comforter, with him all things ae posible', 'B.Tech Medical Laboratory Science', 'Off-Campus', 'Music And Drama Director(2023/2024), (2024/2025)', 'uploads/leadership/1782546036_IMG_3829.jpeg', 10, 1),
(29, 'Dennister Safo', 'Hall rep synagogue', 'lcc', '2025/2026', 'To win more soul for Christ', 'B.Tech Marketing', 'Getfund Hall', 'None ', 'uploads/leadership/1782509298_336237.jpg', 21, 1),
(30, 'Clement  Amanamah Kwofie', 'Political chamber coordinator', 'lcc', '2025/2026', '…….', 'Other', 'Other', 'Deputy prayer secretary ', 'uploads/leadership/1782512250_IMG_2095.jpeg', 11, 1),
(31, 'Prof. Gladys Quartey', 'Patroness ', 'patroness', 'N/A', 'Nation Women’s Secretary, The Church of Pentecost.\r\nDean of Built and Natural Environment, Takoradi Technical University ', 'N/A', 'N/A', 'N/A', 'uploads/leadership/1782572013_ce6329eb-b53e-4031-8689-ad15262746ac.jpeg', 0, 1),
(32, 'Elder Elijah Abidoo', 'President', 'ec', '2025/2026', '', 'B.Tech Medical Laboratory Science', 'Off-Campus', 'Gent Wing Coordinator(2024/2025)', 'uploads/leadership/1782635037_WhatsAppImage2026-06-28at8.20.19AM.jpeg', 1, 1),
(33, 'Lady Angelina Nyarko', 'Assistant Music Director', 'lcc', '2025/2026', 'I am very grateful for PENSA TTU and I pray God continue to use His church to impact and do more exploit for His kingdom', 'Other', 'Getfund Hall', 'N/A', '', 22, 1);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'General',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `display_order`, `title`, `content`, `excerpt`, `image_url`, `category`, `created_at`) VALUES
(1, 0, 'Boadu-Dwamena', 'Professor Godfred Alufar Bokpin, an Economist, says Ghana currently lacks the capacity to effectively manage and benefit from full-scale resource nationalisation.\r\n\r\n“We currently lack the full capacity to handle the entire value chain, from extraction to refining, at the scale required,” he said.\r\n\r\nHis remarks come amid renewed calls by the Institute of Economic Affairs (IEA) for Ghana to assert stronger ownership over its mineral wealth, including limiting the role of multinational mining companies.\r\n\r\nProfessor Godfred Alufar Bokpin, an Economist, says Ghana currently lacks the capacity to effectively manage and benefit from full-scale resource nationalisation.\r\n\r\n“We currently lack the full capacity to handle the entire value chain, from extraction to refining, at the scale required,” he said.\r\n\r\nHis remarks come amid renewed calls by the Institute of Economic Affairs (IEA) for Ghana to assert stronger ownership over its mineral wealth, including limiting the role of multinational mining companies.\r\n\r\nProfessor Godfred Alufar Bokpin, an Economist, says Ghana currently lacks the capacity to effectively manage and benefit from full-scale resource nationalisation.\r\n\r\n“We currently lack the full capacity to handle the entire value chain, from extraction to refining, at the scale required,” he said.\r\n\r\nHis remarks come amid renewed calls by the Institute of Economic Affairs (IEA) for Ghana to assert stronger ownership over its mineral wealth, including limiting the role of multinational mining companies.\r\n\r\nProfessor Godfred Alufar Bokpin, an Economist, says Ghana currently lacks the capacity to effectively manage and benefit from full-scale resource nationalisation.\r\n\r\n“We currently lack the full capacity to handle the entire value chain, from extraction to refining, at the scale required,” he said.\r\n\r\nHis remarks come amid renewed calls by the Institute of Economic Affairs (IEA) for Ghana to assert stronger ownership over its mineral wealth, including limiting the role of multinational mining companies.Professor Godfred Alufar Bokpin, an Economist, says Ghana currently lacks the capacity to effectively manage and benefit from full-scale resource nationalisation.\r\n\r\n“We currently lack the full capacity to handle the entire value chain, from extraction to refining, at the scale required,” he said.\r\n\r\nHis remarks come amid renewed calls by the Institute of Economic Affairs (IEA) for Ghana to assert stronger ownership over its mineral wealth, including limiting the role of multinational mining companies.\r\n\r\n', NULL, '../uploads/news/news_1779245465_9728.png', 'Announcement', '2026-05-20 02:51:05');

-- --------------------------------------------------------

--
-- Table structure for table `prayer_requests`
--

CREATE TABLE `prayer_requests` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `user_status` enum('Alumni','Student') NOT NULL,
  `prayer_text` text NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','prayed') DEFAULT 'pending',
  `prayed_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sermons`
--

CREATE TABLE `sermons` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'teaching',
  `speaker` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `audio_url` varchar(500) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `date_preached` date DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sermons`
--

INSERT INTO `sermons` (`id`, `title`, `category`, `speaker`, `description`, `audio_url`, `image_url`, `date_preached`, `featured`, `display_order`, `is_active`, `created_at`) VALUES
(1, 'Breakthrough Prayer', 'power-night', 'Pastor David Mensah', 'Powerful intercessory session focusing on supernatural breakthroughs and spiritual warfare.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'uploads/sermons/1776253558_PENSATTU.png', '2026-04-10', 0, 1, 1, '2026-04-15 11:20:18'),
(2, 'The Heart of Worship', 'worship', 'Sarah Adjei', 'Understanding true worship beyond music — a life of surrender and intimacy with God.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'uploads/sermons/1776254018_632215512_902796622451445_2216006913033759055_n.jpg', '2026-04-05', 1, 2, 1, '2026-04-15 11:20:18'),
(3, 'Faith That Moves Mountains', 'teaching', 'Rev. Michael Asare', 'Deep dive into Hebrews 11 — activating mountain-moving faith in your daily walk.', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80', '2026-03-28', 0, 3, 1, '2026-04-15 11:20:18');

-- --------------------------------------------------------

--
-- Table structure for table `sermon_settings`
--

CREATE TABLE `sermon_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sermon_settings`
--

INSERT INTO `sermon_settings` (`id`, `setting_key`, `setting_value`, `setting_label`, `updated_at`) VALUES
(1, 'hero_title', 'Sermons & Messages', 'Hero Title', '2026-04-15 11:20:17'),
(2, 'hero_subtitle', 'Experience life-changing teachings, powerful worship, and prophetic declarations from PENSA TTU. Download, listen, and be blessed.', 'Hero Subtitle', '2026-04-15 11:20:17'),
(3, 'featured_title', 'Breakthrough Prayer', 'Featured Sermon Title', '2026-04-15 19:02:01'),
(4, 'featured_speaker', 'Pastor David Mensah', 'Featured Sermon Speaker', '2026-04-15 19:02:01'),
(5, 'featured_date', 'April 2026', 'Featured Sermon Date', '2026-04-15 11:20:17'),
(6, 'featured_description', 'A life-transforming message about walking in the power of the Holy Spirit, living a life of boldness, and igniting revival on campus.', 'Featured Sermon Description', '2026-04-15 11:20:17'),
(7, 'featured_audio', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Featured Sermon Audio URL', '2026-04-15 11:20:17'),
(8, 'featured_image', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80', 'Featured Sermon Image URL', '2026-04-15 11:20:17');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT 'fas fa-church',
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `icon`, `description`, `display_order`, `is_active`) VALUES
(1, 'Sunday Special Service', 'fas fa-church', 'Sunday | 6:30 AM\r\nExclusive Word Study & Prayer', 1, 1),
(2, 'Inter Departmental Prayers', 'fas fa-hands-praying', 'Monday | 6:30 PM\r\nMoment Of Prayer', 2, 1),
(3, 'Makers Midweek Service', 'fas fa-book-bible', 'Wednesday | 6:00 PM\r\nInteractive Word study | Discipleship.\r\nPrayers', 3, 1),
(4, 'Departmental Meetings', 'fas fa-handshake', 'Friday | 6:00 AM \r\nDepartmental Meetings \r\n', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `timeline_events`
--

CREATE TABLE `timeline_events` (
  `id` int(11) NOT NULL,
  `year` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `speaker` varchar(255) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `embed_url` varchar(500) DEFAULT NULL,
  `platform` varchar(50) DEFAULT 'youtube',
  `youtube_url` varchar(500) NOT NULL,
  `category` varchar(100) DEFAULT 'sermon',
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `speaker`, `video_url`, `embed_url`, `platform`, `youtube_url`, `category`, `display_order`, `is_active`, `created_at`) VALUES
(1, ' 2026 Theme Unveiled by the Chairman, The Church Of Pentecost', 'Apostle Eric Nyamekye ', 'https://youtu.be/r-J0tSLIZhc?si=-NBckdjZizZe1XJh', 'https://www.youtube.com/embed/r-J0tSLIZhc', 'youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Theme of 2026', 1, 1, '2026-04-15 11:20:18'),
(2, 'Our Periods of Fasting', 'Apostle Eric Nyamekye ', 'https://youtu.be/ZuO-uWCNeKs?si=XIeD0hAxoWCfw9N4', 'https://www.youtube.com/embed/ZuO-uWCNeKs', 'youtube', 'https://www.youtube.com/embed/3JZ_D3ELwOQ', 'Revival', 2, 1, '2026-04-15 11:20:18'),
(3, 'Evangelistic Mission', 'Sector Outreach', 'https://www.tiktok.com/@pensa_ttu/video/7638344702185590034?is_from_webapp=1&sender_device=pc&web_id=7640789397067433473', 'https://www.tiktok.com/embed/v2/7638344702185590034', 'tiktok', 'https://www.youtube.com/embed/5qap5aO4i9A', 'Mission 2026', 3, 1, '2026-04-15 11:20:18'),
(4, 'Evangelistic Missions', 'Sector Outreach', 'https://www.tiktok.com/@pensa_ttu/video/7637585051558989064?is_from_webapp=1&sender_device=pc&web_id=7640789397067433473', 'https://www.tiktok.com/embed/v2/7637585051558989064', 'tiktok', '', 'Mission 2026 cont..', 5, 1, '2026-05-17 09:28:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_gallery`
--
ALTER TABLE `about_gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_settings`
--
ALTER TABLE `about_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `albums`
--
ALTER TABLE `albums`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `contact_settings`
--
ALTER TABLE `contact_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `core_values`
--
ALTER TABLE `core_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `album_id` (`album_id`);

--
-- Indexes for table `hero_slider`
--
ALTER TABLE `hero_slider`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `home_settings`
--
ALTER TABLE `home_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `leadership`
--
ALTER TABLE `leadership`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prayer_requests`
--
ALTER TABLE `prayer_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category` (`category`),
  ADD KEY `status` (`status`),
  ADD KEY `user_status` (`user_status`);

--
-- Indexes for table `sermons`
--
ALTER TABLE `sermons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sermon_settings`
--
ALTER TABLE `sermon_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timeline_events`
--
ALTER TABLE `timeline_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_gallery`
--
ALTER TABLE `about_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `about_settings`
--
ALTER TABLE `about_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `albums`
--
ALTER TABLE `albums`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `contact_settings`
--
ALTER TABLE `contact_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `core_values`
--
ALTER TABLE `core_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=685;

--
-- AUTO_INCREMENT for table `hero_slider`
--
ALTER TABLE `hero_slider`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `home_settings`
--
ALTER TABLE `home_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `leadership`
--
ALTER TABLE `leadership`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `prayer_requests`
--
ALTER TABLE `prayer_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sermons`
--
ALTER TABLE `sermons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sermon_settings`
--
ALTER TABLE `sermon_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `timeline_events`
--
ALTER TABLE `timeline_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gallery`
--
ALTER TABLE `gallery`
  ADD CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
