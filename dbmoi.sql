-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: dbts
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analytics`
--

DROP TABLE IF EXISTS `analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics` (
  `job_id` varchar(36) NOT NULL,
  `views_count` int DEFAULT '0',
  `application_count` int DEFAULT '0',
  `conversion_rate` decimal(5,2) DEFAULT '0.00',
  `company_rating` decimal(3,2) DEFAULT '0.00',
  PRIMARY KEY (`job_id`),
  CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics`
--

LOCK TABLES `analytics` WRITE;
/*!40000 ALTER TABLE `analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bots`
--

DROP TABLE IF EXISTS `bots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bots` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `space_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `input_rate` float DEFAULT NULL,
  `output_rate` float DEFAULT NULL,
  `default_input_rate` float DEFAULT NULL,
  `default_output_rate` float DEFAULT NULL,
  `feature` enum('image','text','audio','video') COLLATE utf8mb4_general_ci DEFAULT 'text',
  `supplier_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bots`
--

LOCK TABLES `bots` WRITE;
/*!40000 ALTER TABLE `bots` DISABLE KEYS */;
INSERT INTO `bots` VALUES ('claude-3-5-haiku-latest','claude-3-5-haiku-latest','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.25,1,NULL,NULL,'text','anthropic'),('claude-3-5-sonnet-latest','claude-3-5-sonnet-latest','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.25,1.5,NULL,NULL,'text','anthropic'),('claude-3-opus-latest','claude-3-opus-latest','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.125,0.3,NULL,NULL,'text','anthropic'),('dall-e-3','dall-e-3','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',1500,4500,NULL,NULL,'image','openai'),('deepseek-chat','deepseek-chat','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.075,0.3,NULL,NULL,'text','deepseek'),('deepseek-reasoner','deepseek-reasoner','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.25,1,NULL,NULL,'text','googleai'),('gemini-1.5-flash','gemini-1.5-flash','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.075,0.3,NULL,NULL,'text','googleai'),('gemini-1.5-pro','gemini-1.5-pro','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.25,1,NULL,NULL,'text','googleai'),('gemini-2.0-flash','gemini-2.0-flash','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.125,0.45,NULL,NULL,'text','googleai'),('gpt-4o','gpt-4o','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',0.25,1.5,0.25,0.25,'text','openai'),('gpt-4o-mini','gpt-4o-mini','2024-11-27 00:00:00','2024-11-27 00:00:00','7441149405946085393',0.075,0.3,0.25,0.25,'text','openai'),('o1-mini','o1-mini','2024-12-03 04:21:16','2024-12-03 04:21:16','7441149405946085393',0.5,1.5,NULL,NULL,'text','openai'),('o1-preview','o1-preview','2024-12-03 04:21:16','2024-12-03 04:21:16','7441149405946085393',1,3,NULL,NULL,'text','openai'),('tts-1','tts-1','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',6,6,NULL,NULL,'audio','openai'),('tts-1-hd','tts-1-hd','2024-12-03 02:21:32','2024-12-03 02:21:32','7441149405946085393',12,12,NULL,NULL,'audio','openai');
/*!40000 ALTER TABLE `bots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_licenses`
--

DROP TABLE IF EXISTS `business_licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_licenses` (
  `license_id` varchar(36) NOT NULL,
  `company_id` varchar(36) NOT NULL,
  `business_license_status` enum('verified','pending','rejected') DEFAULT 'pending',
  `business_license_verified_at` datetime DEFAULT NULL,
  `business_license_verified_by` varchar(255) DEFAULT NULL,
  `tax_id` varchar(20) DEFAULT NULL,
  `registration_number` varchar(20) DEFAULT NULL,
  `license_issue_date` date DEFAULT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `founded_year` int DEFAULT NULL,
  `business_license_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`license_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `business_licenses_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_licenses`
--

LOCK TABLES `business_licenses` WRITE;
/*!40000 ALTER TABLE `business_licenses` DISABLE KEYS */;
INSERT INTO `business_licenses` VALUES ('2a99965e-054f-11f0-9da5-2cf05db24bc7','1','pending','2024-01-01 00:00:00','admin','0692824848','REG68381','2023-01-01','2028-01-01','contact@techcorp.com','0340630839','Công nghệ thông tin',2012,NULL),('2a999fb9-054f-11f0-9da5-2cf05db24bc7','2','verified','2024-01-01 00:00:00','admin','0236562588','REG22773','2023-01-01','2028-01-01','contact@healthplus.com','0429011898','Y tế & Chăm sóc sức khỏe',2005,NULL),('2a99a21c-054f-11f0-9da5-2cf05db24bc7','3','verified','2024-01-01 00:00:00','admin','0022163052','REG72528','2023-01-01','2028-01-01','contact@edulearn.com','0559991179','Giáo dục & Đào tạo',2011,NULL),('2a99a3f9-054f-11f0-9da5-2cf05db24bc7','4','verified','2024-01-01 00:00:00','admin','0440365236','REG32961','2023-01-01','2028-01-01','contact@greenworld.com','0327019148','Khác',2011,NULL),('2a99b51f-054f-11f0-9da5-2cf05db24bc7','5','verified','2024-01-01 00:00:00','admin','0250076973','REG31170','2023-01-01','2028-01-01','contact@foodiepro.com','0808290443','Thực phẩm & Đồ uống',1993,NULL),('2a99b7c4-054f-11f0-9da5-2cf05db24bc7','6','verified','2024-01-01 00:00:00','admin','0106825948','REG21510','2023-01-01','2028-01-01','contact@fintechsolutions.com','0755079305','Tài chính & Ngân hàng',1994,NULL),('2a99bd14-054f-11f0-9da5-2cf05db24bc7','8','verified','2024-01-01 00:00:00','admin','0427337151','REG14305','2023-01-01','2028-01-01','contact@smarthome.com','0433248790','Khác',2015,NULL),('2a99beae-054f-11f0-9da5-2cf05db24bc7','9','verified','2024-01-01 00:00:00','admin','0385692940','REG71719','2023-01-01','2028-01-01','contact@cybertech.com','0428927022','Công nghệ thông tin',2023,NULL),('2a99c01a-054f-11f0-9da5-2cf05db24bc7','10','verified','2024-01-01 00:00:00','admin','0678377255','REG41278','2023-01-01','2028-01-01','contact@fashionx.com','0028824938','Khác',2020,NULL),('2a99c1a7-054f-11f0-9da5-2cf05db24bc7','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','verified','2024-01-01 00:00:00','admin','0442278799','REG49413','2023-01-01','2028-01-01','contact@techrecruitersinc.com','0143873030','Công nghệ thông tin',1998,NULL),('2a99c404-054f-11f0-9da5-2cf05db24bc7','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','verified','2024-01-01 00:00:00','admin','0753078654','REG05457','2023-01-01','2028-01-01','contact@jobsnowltd.com','0013637449','Khác',2020,NULL),('bl-bok4cfjrn','7','verified','2024-01-01 00:00:00','admin','234235dddđsss','Ho truong an','2022-02-27','2028-11-16','ngducvicc@gmail.com','0928343248','Khác gì dâuđ',1991,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1744706337/business_licenses/business_license_bl-bok4cfjrn_1744706334105.jpg');
/*!40000 ALTER TABLE `business_licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_certifications`
--

DROP TABLE IF EXISTS `candidate_certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_certifications` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `certification_name` varchar(255) NOT NULL,
  `issuing_organization` varchar(255) NOT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `credential_id` varchar(255) DEFAULT NULL,
  `credential_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `candidate_certifications_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`candidate_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_certifications`
--

LOCK TABLES `candidate_certifications` WRITE;
/*!40000 ALTER TABLE `candidate_certifications` DISABLE KEYS */;
INSERT INTO `candidate_certifications` VALUES ('cert-002','1','React Developer','Meta','2023-03-20','2026-03-20','META-REACT-456','https://coursera.org/meta/react-456','2025-02-18 17:11:00'),('cert-003','3','Frontend Web Developer','Udacity','2023-02-10','2026-02-10','FE-DEV-789','https://udacity.com/cert/FE-DEV-789','2025-02-18 17:11:00'),('cert-004','3','React Native Specialist','Meta','2023-04-15','2026-04-15','META-RN-101','https://coursera.org/meta/rn-101','2025-02-18 17:11:00'),('cert-005','2','Python Developer','Python Institute','2023-01-25','2026-01-25','PCEP-123','https://pythoninstitute.org/cert/PCEP-123','2025-02-18 17:11:00'),('cert-006','2','Django Framework','Django Software Foundation','2023-03-30','2026-03-30','DSF-456','https://djangoproject.com/cert/DSF-456','2025-02-18 17:11:00'),('cert-007','4','PHP Advanced','Zend','2023-02-20','2026-02-20','PHP-ADV-789','https://zend.com/cert/PHP-ADV-789','2025-02-18 17:11:00'),('cert-008','4','Laravel Expert','Laravel','2023-05-01','2026-05-01','LARAVEL-101','https://laravel.com/cert/LARAVEL-101','2025-02-18 17:11:00'),('cert-009','5','Java SE 11 Developer','Oracle','2023-01-10','2026-01-10','OCJP-123','https://oracle.com/cert/OCJP-123','2025-02-18 17:11:00'),('cert-010','5','Spring Framework','VMware','2023-03-15','2026-03-15','SPRING-456','https://vmware.com/cert/SPRING-456','2025-02-18 17:11:00'),('cert-011','6','C++ Programming','Microsoft','2023-02-05','2026-02-05','CPP-789','https://microsoft.com/cert/CPP-789','2025-02-18 17:11:00'),('cert-012','6','Full Stack JavaScript','MongoDB','2023-04-20','2026-04-20','MEAN-101','https://mongodb.com/cert/MEAN-101','2025-02-18 17:11:00'),('cert-013','14','Android Developer','Google','2023-01-20','2026-01-20','AND-123','https://google.com/cert/AND-123','2025-02-18 17:11:00'),('cert-014','15','Kotlin Developer','JetBrains','2023-03-25','2026-03-25','KOT-456','https://jetbrains.com/cert/KOT-456','2025-02-18 17:11:00'),('cert-015','18','iOS Developer','Apple','2023-02-15','2026-02-15','IOS-789','https://apple.com/cert/IOS-789','2025-02-18 17:11:00'),('cert-016','18','Swift Programming','Apple','2023-04-25','2026-04-25','SWIFT-101','https://apple.com/cert/SWIFT-101','2025-02-18 17:11:00'),('cert-017','12','MySQL Database Administrator','Oracle','2023-01-05','2026-01-05','MYSQL-123','https://oracle.com/cert/MYSQL-123','2025-02-18 17:11:00'),('cert-018','12','SQL Server Specialist','Microsoft','2023-03-10','2026-03-10','MSSQL-456','https://microsoft.com/cert/MSSQL-456','2025-02-18 17:11:00'),('cert-019','17','Docker Certified Associate','Docker','2023-02-25','2026-02-25','DCA-789','https://docker.com/cert/DCA-789','2025-02-18 17:11:00'),('cert-020','17','Kubernetes Administrator','CNCF','2023-04-30','2026-04-30','CKA-101','https://cncf.io/cert/CKA-101','2025-02-18 17:11:00'),('cert-lj368yqbq','1','Ducviljhkljhlkj','ducvi','2025-01-28','2025-02-22','jav1032','hhgg','2025-02-21 01:52:06');
/*!40000 ALTER TABLE `candidate_certifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_cvs`
--

DROP TABLE IF EXISTS `candidate_cvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_cvs` (
  `cv_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `cv_name` varchar(255) NOT NULL,
  `cv_link` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_template` tinyint DEFAULT '0',
  PRIMARY KEY (`cv_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `candidate_cvs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_cvs`
--

LOCK TABLES `candidate_cvs` WRITE;
/*!40000 ALTER TABLE `candidate_cvs` DISABLE KEYS */;
INSERT INTO `candidate_cvs` VALUES ('001',5,'Test_cv','cv.link','2025-01-14 13:36:32','2025-04-25 07:19:32',0),('002',4,'Test_cv','cv.link','2025-01-14 13:36:32','2025-03-14 18:35:55',1),('cand-cv-0ux5hgp3x',5,'Blue Simple Professional CV Resume.pdf','https://res.cloudinary.com/dh5cevmhm/image/upload/v1745554451/cvs/nnnnkbjpkrk7mkkqbbhg.pdf','2025-04-25 04:14:11','2025-04-25 07:18:45',0),('cand-cv-0w8geadcc',5,'ReviewCV_InternBackEnd_HuynhDoanTam.pdf','./ReviewCV_InternBackEnd_HuynhDoanTam.pdf','2025-04-15 07:49:14','2025-04-25 07:18:46',0),('cand-cv-44a5roc80',33,'3120410305_VoDinhLuan_Baocaothuctap (2).pdf','./3120410305_VoDinhLuan_Baocaothuctap (2).pdf','2025-04-15 09:13:09','2025-04-15 09:13:09',0),('cand-cv-oztvryt5d',5,'Blue Simple Professional CV Resume.pdf','https://res.cloudinary.com/dh5cevmhm/image/upload/v1745566327/cvs/gl11evkkzxhdlsg0jxrt.pdf','2025-04-25 07:32:07','2025-04-25 07:32:18',1),('cand-cv-xohfmgkuj',5,'CV Hoàng Công Đức Intern Backend JAVA HN.pdf','https://res.cloudinary.com/dh5cevmhm/image/upload/v1745554621/cvs/pyoljflpxex3fmfaembj.pdf','2025-04-25 04:17:01','2025-04-25 07:32:18',0);
/*!40000 ALTER TABLE `candidate_cvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_education`
--

DROP TABLE IF EXISTS `candidate_education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_education` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `institution` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `field_of_study` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `activities` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `candidate_education_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`candidate_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_education`
--

LOCK TABLES `candidate_education` WRITE;
/*!40000 ALTER TABLE `candidate_education` DISABLE KEYS */;
INSERT INTO `candidate_education` VALUES ('edu-002','2','University of Information Technology','Bachelor','Information Technology','2015-09-01','2019-06-30','3.3/4.0','IT Club Leader\nWon 2nd prize in University Hackathon','2025-02-18 17:08:06'),('edu-003','3','University of Engineering','Bachelor','Software Engineering','2017-09-01','2021-06-30','3.6/4.0','Software Development Club Member\nIntern at Tech Company','2025-02-18 17:08:06'),('edu-004','4','National University','Master','Computer Science','2015-09-01','2020-06-30','3.8/4.0','Research Assistant\nPublished 2 papers in Software Engineering','2025-02-18 17:08:06'),('edu-005','5','NGuyen','PhD','Kỹ thuật phần mềmm','2025-02-21','2025-02-20','3.4/4.0','Java Programming Club\nParticipated in Google Developer Challenge','2025-02-18 17:08:06'),('edu-006','6','University of Technology','Bachelor','Computer Engineering','2015-09-01','2019-06-30','3.5/4.0','Robotics Club Member\nWon University Programming Contest','2025-02-18 17:08:06'),('edu-007','7','Design University','Bachelor','Web Development','2018-09-01','2022-06-30','3.2/4.0','Web Design Club\nFreelance Web Developer','2025-02-18 17:08:06'),('edu-008','8','Technology Institute','Bachelor','Information Technology','2016-09-01','2020-06-30','3.4/4.0','IT Club Member\nIntern at Software Company','2025-02-18 17:08:06'),('edu-009','9','Engineering University','Master','Web Engineering','2014-09-01','2019-06-30','3.7/4.0','Teaching Assistant\nWeb Development Workshop Instructor','2025-02-18 17:08:06'),('edu-010','10','Software University','Bachelor','Software Engineering','2013-09-01','2017-06-30','3.5/4.0','Backend Development Club\nHackathon Winner','2025-02-18 17:08:06'),('edu-011','11','Technical College','Bachelor','Web Development','2014-09-01','2018-06-30','3.3/4.0','Frontend Development Club\nWeb Design Competition Winner','2025-02-18 17:08:06'),('edu-012','12','University of Science','Bachelor','Computer Science','2016-09-01','2020-06-30','3.6/4.0','Database Management Club\nSQL Competition Participant','2025-02-18 17:08:06'),('edu-013','13','Technology Univeff','Master','Software Engineeringf','2015-09-01','2020-06-30','3.8/4.0','Research in Software Architecture\nPublished Paper on Cloud Computing','2025-02-18 17:08:06'),('edu-014','14','Mobile Development Institute','Bachelor','Computer Science','2016-09-01','2020-06-30','3.4/4.0','Mobile App Development Club\nAndroid App Competition Winner','2025-02-18 17:08:06'),('edu-015','15','Information Systems College','Bachelor','Information Systems','2018-09-01','2022-06-30','3.2/4.0','Python Programming Club\nData Science Workshop Participant','2025-02-18 17:08:06'),('edu-016','16','Web Engineering School','Master','Web Engineering','2016-09-01','2021-06-30','3.7/4.0','UI/UX Design Club\nWeb Accessibility Research','2025-02-18 17:08:06'),('edu-017','17','Engineering Institute','Bachelor','Computer Engineering','2015-09-01','2019-06-30','3.5/4.0','Cloud Computing Club\nDevOps Workshop Organizer','2025-02-18 17:08:06'),('edu-018','18','Mobile Technology University','Bachelor','Software Engineering','2014-09-01','2018-06-30','3.6/4.0','iOS Development Club\nMobile App Hackathon Winner','2025-02-18 17:08:06'),('edu-0dynd8f0m','1','Trường đại học công nghiệp thành phố hồ chí minh','High School','Kỹ thuật phần mềmádsadasd','2025-02-04','2025-03-01',NULL,NULL,'2025-02-20 13:13:22'),('edu-2nb8hkf85','1','Trường đại học công nghiệp thành phố hồ chí minh','sdfsdf','sdfsdf','2025-01-31','2025-02-04','sdfsdfsd234','dfdf','2025-02-20 14:23:14'),('edu-gyx58w31t','1','Technical Universitysss','PhD','aducvidd','2025-01-28','2025-02-15',NULL,NULL,'2025-02-20 13:08:22');
/*!40000 ALTER TABLE `candidate_education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_experiences`
--

DROP TABLE IF EXISTS `candidate_experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_experiences` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '0',
  `job_description` text,
  `achievements` text,
  `location` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `position` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `candidate_experiences_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`candidate_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_experiences`
--

LOCK TABLES `candidate_experiences` WRITE;
/*!40000 ALTER TABLE `candidate_experiences` DISABLE KEYS */;
INSERT INTO `candidate_experiences` VALUES ('exp-001','1','Tech Nfuyn','Frontend Developer vc','2025-01-28','2025-02-08',1,'• Phát triển và duy trì các ứng dụng web sử dụng JavaScript và Node.js\n• Tối ưu hóa hiệu suất frontend và trải nghiệm người dùng\n• Làm việc với team Agile 5 ngườidđ','• Cải thiện 40% tốc độ tải trang\n• Phát triển thành công 3 dự án lớn','Ho Chi Minh City','2024-01-01 00:00:00','Frontendsss'),('exp-003','2','DataSoft Systems','Python Backend Developer','2021-01-01',NULL,1,'• Phát triển API và microservices với Django\n• Tối ưu hóa hiệu suất database\n• Triển khai CI/CD pipeline','• Giảm 50% thời gian phản hồi API\n• Xây dựng hệ thống xử lý 1M requests/ngày','Ho Chi Minh City','2024-01-01 00:00:00','Frontend'),('exp-004','2','Tech Corp','Junior Backend Developer','2019-01-01','2020-12-31',0,'• Phát triển backend services với Python\n• Viết unit tests và integration tests\n• Làm việc với MongoDB và PostgreSQL','• Đạt 95% test coverage\n• Tối ưu 30% queries','Ha Noi','2024-01-01 00:00:00','Frontend'),('exp-005','3','WebDev Solutions','Full Stack Developer','2023-01-01',NULL,1,'• Phát triển ứng dụng web với React và Node.js\n• Thiết kế và triển khai REST APIs\n• Làm việc với SQL và NoSQL databases','• Hoàn thành 5 dự án full-stack\n• Đóng góp vào việc cải thiện quy trình phát triển','Da Nang','2024-01-01 00:00:00','Frontend'),('exp-006','4','PHP Solutions Ltd.','Senior PHP Developer','2020-01-01',NULL,1,'• Lead team phát triển 5 người\n• Phát triển và maintain các ứng dụng Laravel\n• Tối ưu hóa database và caching','• Cải thiện 60% performance\n• Mentoring 3 junior developers','Ho Chi Minh City','2024-01-01 00:00:00','Frontend'),('exp-007','4','Web Technologies','PHP Developer','2018-01-01','2019-12-31',0,'• Phát triển website với PHP và MySQL\n• Implement payment gateway integrations\n• Viết technical documentation','• Xử lý 100K+ transactions/tháng\n• Đạt chứng chỉ Laravel Expert','Ho Chi Minh City','2024-01-01 00:00:00','Frontend'),('exp-008','5','Java Enterprise Co.','Java Developer','2022-01-01',NULL,1,'• Phát triển ứng dụng enterprise với Spring Boot\n• Thiết kế RESTful APIs\n• Làm việc với microservices architecture','• Triển khai thành công 3 microservices\n• Cải thiện 45% response time','Ho Chi Minh City','2024-01-01 00:00:00','Frontend'),('exp-009','5','Tech Solutions','Junior Java Developer','2020-01-01','2021-12-31',0,'• Phát triển và maintain Java applications\n• Unit testing với JUnit\n• Code review và documentation','• 90% test coverage\n• Tối ưu memory usage 30%','Ha Noi','2024-01-01 00:00:00','Frontend'),('exp-3txinvsgd','15','fdgdfg','dfgfdg','2025-01-28','2025-02-07',0,'dfgfdg','dfgdfgdfg',NULL,'2025-02-20 14:42:06','dfgfdg'),('exp-d0qzilbn1','cand-tue39hyz3','BitAi','sdfsdf','2025-04-08','2025-03-30',0,'fdgdf','fdgdfgdfg',NULL,'2025-04-15 08:50:24','sdfsdf');
/*!40000 ALTER TABLE `candidate_experiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_languages`
--

DROP TABLE IF EXISTS `candidate_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_languages` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `language` varchar(100) NOT NULL,
  `proficiency` enum('Basic','Intermediate','Advanced','Native') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `candidate_languages_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`candidate_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_languages`
--

LOCK TABLES `candidate_languages` WRITE;
/*!40000 ALTER TABLE `candidate_languages` DISABLE KEYS */;
INSERT INTO `candidate_languages` VALUES ('lang-001','1','China','Advanced','2025-02-18 17:01:41'),('lang-002','1','Vietnamese','Native','2025-02-18 17:01:41'),('lang-004','2','English','Intermediate','2025-02-18 17:01:41'),('lang-005','2','Vietnamese','Native','2025-02-18 17:01:41'),('lang-006','3','English','Advanced','2025-02-18 17:01:41'),('lang-007','3','Vietnamese','Native','2025-02-18 17:01:41'),('lang-008','3','Korean','Basic','2025-02-18 17:01:41'),('lang-009','4','English','Advanced','2025-02-18 17:01:41'),('lang-010','4','Vietnamese','Native','2025-02-18 17:01:41'),('lang-011','4','French','Intermediate','2025-02-18 17:01:41'),('lang-012','5','English','Intermediate','2025-02-18 17:01:41'),('lang-013','5','Vietnamese','Native','2025-02-18 17:01:41'),('lang-014','6','English','Advanced','2025-02-18 17:01:41'),('lang-015','6','Vietnamese','Native','2025-02-18 17:01:41'),('lang-016','6','Chinese','Basic','2025-02-18 17:01:41'),('lang-017','7','English','Intermediate','2025-02-18 17:01:41'),('lang-018','7','Vietnamese','Native','2025-02-18 17:01:41'),('lang-019','8','English','Advanced','2025-02-18 17:01:41'),('lang-020','8','Vietnamese','Native','2025-02-18 17:01:41'),('lang-021','8','German','Basic','2025-02-18 17:01:41'),('lang-022','9','English','Advanced','2025-02-18 17:01:41'),('lang-023','9','Vietnamese','Native','2025-02-18 17:01:41'),('lang-024','9','Spanish','Intermediate','2025-02-18 17:01:41'),('lang-025','10','English','Advanced','2025-02-18 17:01:41'),('lang-026','10','Vietnamese','Native','2025-02-18 17:01:41'),('lang-027','10','Japanese','Intermediate','2025-02-18 17:01:41'),('lang-028','11','English','Advanced','2025-02-18 17:01:41'),('lang-029','11','Vietnamese','Native','2025-02-18 17:01:41'),('lang-030','12','English','Intermediate','2025-02-18 17:01:41'),('lang-031','12','Vietnamese','Native','2025-02-18 17:01:41'),('lang-032','12','Chinese','Basic','2025-02-18 17:01:41'),('lang-033','13','English','Advanced','2025-02-18 17:01:41'),('lang-034','13','Vietnamese','Native','2025-02-18 17:01:41'),('lang-035','13','Korean','Basic','2025-02-18 17:01:41'),('lang-036','14','English','Advanced','2025-02-18 17:01:41'),('lang-037','14','Vietnamese','Native','2025-02-18 17:01:41'),('lang-038','15','English','Intermediate','2025-02-18 17:01:41'),('lang-039','15','Vietnamese','Native','2025-02-18 17:01:41'),('lang-040','15','French','Basic','2025-02-18 17:01:41'),('lang-041','16','English','Advanced','2025-02-18 17:01:41'),('lang-042','16','Vietnamese','Native','2025-02-18 17:01:41'),('lang-043','17','English','Advanced','2025-02-18 17:01:41'),('lang-044','17','Vietnamese','Native','2025-02-18 17:01:41'),('lang-045','17','German','Intermediate','2025-02-18 17:01:41'),('lang-046','18','English','Advanced','2025-02-18 17:01:41'),('lang-047','18','Vietnamese','Native','2025-02-18 17:01:41'),('lang-048','18','Japanese','Basic','2025-02-18 17:01:41'),('lang-h2lndb4gs','1','Đức','Basic','2025-02-21 01:42:37');
/*!40000 ALTER TABLE `candidate_languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_projects`
--

DROP TABLE IF EXISTS `candidate_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_projects` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `technologies_used` text,
  `project_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `candidate_projects_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`candidate_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_projects`
--

LOCK TABLES `candidate_projects` WRITE;
/*!40000 ALTER TABLE `candidate_projects` DISABLE KEYS */;
INSERT INTO `candidate_projects` VALUES ('proj-002','1','Dashboard Analytics','Phát triển dashboard theo dõi và phân tích dữ liệu','2023-07-01','2023-12-31','Frontend Lead','Vue.js, Vuex, Chart.js','https://dashboard-analytics.com','2024-01-15 10:00:00'),('proj-003','2','API Gateway Service','Xây dựng hệ thống API Gateway cho microservices','2023-01-01','2023-08-31','Backend Developer','Python, Django, Docker, Redis','https://api-gateway.com','2024-01-15 10:00:00'),('proj-004','2','Data Processing Pipeline','Phát triển pipeline xử lý dữ liệu lớn','2023-09-01','2024-01-31','Lead Developer','Python, Apache Kafka, PostgreSQL','https://data-pipeline.com','2024-01-15 10:00:00'),('proj-005','3','Social Media Platform','Xây dựng nền tảng mạng xã hội','2023-03-01','2023-09-30','Full Stack Developer','React, Node.js, MongoDB, WebSocket','https://social-platform.com','2024-01-15 10:00:00'),('proj-006','3','Task Management System','Phát triển hệ thống quản lý công việc','2023-10-01','2024-01-31','Technical Lead','React, Express.js, PostgreSQL','https://task-management.com','2024-01-15 10:00:00'),('proj-007','4','CRM System','Xây dựng hệ thống quản lý khách hàng','2023-01-01','2023-07-31','Backend Lead','PHP, Laravel, MySQL, Redis','https://crm-system.com','2024-01-15 10:00:00'),('proj-008','4','Payment Integration','Tích hợp các cổng thanh toán','2023-08-01','2023-12-31','Senior Developer','PHP, Laravel, Payment APIs','https://payment-integration.com','2024-01-15 10:00:00'),('proj-009','5','Banking Application','Phát triển ứng dụng ngân hàng','2023-02-01','2023-08-31','Java Developer','Java, Spring Boot, MySQL','https://banking-app.com','2024-01-15 10:00:00'),('proj-010','5','Microservices Architecture','Chuyển đổi hệ thống sang microservices','2023-09-01','2024-01-31','System Architect','Java, Spring Cloud, Docker','https://microservices-arch.com','2024-01-15 10:00:00'),('proj-011','10','Real-time Chat System','Xây dựng hệ thống chat realtime','2023-01-01','2023-06-30','Backend Lead','Node.js, Socket.io, MongoDB','https://chat-system.com','2024-01-15 10:00:00'),('proj-012','10','Job Portal Backend','Phát triển backend cho cổng việc làm','2023-07-01','2023-12-31','Senior Developer','Express.js, PostgreSQL, Redis','https://job-portal.com','2024-01-15 10:00:00'),('proj-013','11','Healthcare Platform','Xây dựng nền tảng chăm sóc sức khỏe','2023-03-01','2023-09-30','Frontend Lead','Angular, TypeScript, RxJS','https://healthcare-platform.com','2024-01-15 10:00:00'),('proj-014','11','Admin Dashboard','Phát triển dashboard quản trị','2023-10-01','2024-01-31','Technical Lead','Angular, NgRx, Material Design','https://admin-dashboard.com','2024-01-15 10:00:00'),('proj-015','15','Fitness Tracking App','Ứng dụng theo dõi sức khỏe và thể dục','2023-02-01','2023-08-31','Mobile Developer','Java, Android SDK, Firebase','https://fitness-app.com','2024-01-15 10:00:00'),('proj-016','14','E-learning Mobile App','Ứng dụng học trực tuyến','2023-09-01','2024-01-31','Lead Android Developer','Java, Android, REST APIs','https://elearning-app.com','2024-01-15 10:00:00'),('proj-017','18','Food Delivery App','Ứng dụng giao đồ ăn','2023-01-01','2023-07-31','iOS Developer','Swift, UIKit, CoreData','https://food-delivery.com','2024-01-15 10:00:00'),('proj-018','18','Social Networking App','Ứng dụng mạng xã hội mobile','2023-08-01','2024-01-31','Senior iOS Developer','Swift, SwiftUI, Firebase','https://social-network-app.com','2024-01-15 10:00:00'),('proj-s43x7vd1v','1','Của Nguyễn Đức Vĩ','Xây dựng website thương mại điện tử với đầy đủ tính năng mua sắm','2023-01-01','2023-06-30','Frontend Developer','React, Redux, Material UI, REST API','https://ecommerce-project.com','2025-02-21 02:00:56');
/*!40000 ALTER TABLE `candidate_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidates`
--

DROP TABLE IF EXISTS `candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates` (
  `candidate_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `CV_link` varchar(255) DEFAULT NULL,
  `skills` text,
  `experience` text,
  `qualifications` text,
  `status` enum('Active','Closed','Pending') DEFAULT 'Active',
  `location` varchar(45) DEFAULT 'Sai Gon',
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `marital_status` enum('Single','Married','Other') DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `about_me` text,
  `career_objective` text,
  `current_job_title` varchar(255) DEFAULT NULL,
  `current_company` varchar(255) DEFAULT NULL,
  `expected_salary` decimal(12,2) DEFAULT NULL,
  `current_salary` decimal(12,2) DEFAULT NULL,
  `willing_to_relocate` tinyint(1) DEFAULT '0',
  `preferred_work_location` varchar(255) DEFAULT NULL,
  `employment_type` enum('Full-time','Part-time','Contract','Freelance','Internship') DEFAULT NULL,
  `notice_period` varchar(50) DEFAULT NULL,
  `availability_status` enum('Immediately','In 1 month','In 2 months','In 3 months') DEFAULT NULL,
  `is_searchable` tinyint(1) DEFAULT '1' COMMENT 'Cho phép nhà tuyển dụng tìm thấy hồ sơ',
  `is_actively_searching` tinyint(1) DEFAULT '1' COMMENT 'Đang tích cực tìm việc',
  `industry` varchar(255) DEFAULT 'IT' COMMENT 'Ngành nghề chuyên môn',
  PRIMARY KEY (`candidate_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates`
--

LOCK TABLES `candidates` WRITE;
/*!40000 ALTER TABLE `candidates` DISABLE KEYS */;
INSERT INTO `candidates` VALUES ('1',5,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1745504479/profile_pictures/user_1_1745504476427.jpg','cv1.pdf','JavaScript, Node.js','2 years in front-end development','Bachelor in Computer Science','Pending','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1995-03-15','Male','Single','China','Passionate frontend developer with strong JavaScript skills and modern framework experience.dd','Seeking a challenging position as a Frontend Developer to create innovative web applications.xxx','ddsdffdsđ','Tech Solutions Inc.',25000000.00,1.00,0,'Ho Chi Minh City, Ha Noi','Full-time','1 month','In 1 month',1,1,'IT'),('10',19,'profile10.jpg','cv10.pdf','Node.js, Express','5 years in back-end development','Bachelor in Software Engineering','Closed','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1995-08-14','Male','Single','Vietnamese','Node.js expert with extensive experience in building scalable backend services.','Seeking a Senior Node.js Developer position in a high-growth environment.','Senior Backend Developer','Node Solutions',45000000.00,40000000.00,1,'Ho Chi Minh City, Ha Noi','Full-time','2 months','In 2 months',1,0,'IT'),('11',20,'profile11.jpg','cv11.pdf','Angular, TypeScript','4 years in front-end development','Bachelor in Web Development','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1997-05-27','Female','Married','Vietnamese','Angular specialist with TypeScript expertise and modern web development skills.','Looking for opportunities to lead Angular-based frontend development.','Angular Team Lead','Angular Systems',42000000.00,37000000.00,0,'Ho Chi Minh City','Full-time','3 months','In 3 months',1,1,'IT'),('12',3,'profile12.jpg','cv12.pdf','SQL, MySQL','2 years in database management','Bachelor in Computer Science','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1994-03-19','Male','Single','Vietnamese','Database expert specializing in SQL optimization and database design.','Aiming to contribute database expertise in a challenging role.','Database Administrator','Data Corp',35000000.00,30000000.00,1,'Ho Chi Minh City, Da Nang','Full-time','1 month','In 1 month',1,1,'Education'),('13',22,'profile13.jpg','cv13.pdf','C#, .NET','3 years in software development','Master in Software Engineering','Active','Thành phố Hồ Chí Minh, Quận Gò Vấp','2024-11-20 04:35:32','2024-11-20 04:35:32','1996-11-03','Female','Single','Vietnamese','Experienced .NET developer with strong C# programming skills.','Seeking a .NET Developer position in an enterprise environment.','.NET Developer','Microsoft Partner Co.',38000000.00,33000000.00,1,'Ho Chi Minh City, Ha Noi','Contract','2 weeks','Immediately',1,1,'IT'),('14',23,'profile14.jpg','cv14.pdf','Java, Android','3 years in mobile app development','Bachelor in Computer Science','Active','Tỉnh Hà Giang, Huyện Mèo Vạc','2024-11-20 04:35:32','2024-11-20 04:35:32','1995-07-16','Male','Married','Vietnamese','Mobile developer specializing in Android development with Java.','Looking for Android Developer role in an innovative mobile app company.','Android Developer','Mobile Apps Inc.',35000000.00,30000000.00,0,'Ho Chi Minh City','Full-time','1 month','In 1 month',1,1,'IT'),('15',24,'profile15.jpg','cv15.pdf','Python, Flask','1 year in back-end development','Bachelor in Information Systems','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1998-01-29','Female','Single','Vietnamese','Python developer with Flask framework expertise.','Seeking Python Developer position in a dynamic startup.','Python Developer','Python Solutions',25000000.00,20000000.00,1,'Ho Chi Minh City, Can Tho','Full-time','2 weeks','Immediately',1,1,'IT'),('16',25,'profile16.jpg','cv16.pdf','HTML, CSS','2 years in web development','Master in Web Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1993-09-22','Male','Married','Vietnamese','Frontend specialist focusing on HTML5 and CSS3.','Aiming to create beautiful, responsive web interfaces.','UI Developer','Creative UI',30000000.00,25000000.00,0,'Ho Chi Minh City','Part-time','Immediate','Immediately',1,1,'IT'),('17',26,'profile17.jpg','cv17.pdf','Go, Docker','3 years in system development','Bachelor in Computer Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1996-04-05','Female','Single','Vietnamese','DevOps engineer with expertise in Go and container technologies.','Looking for DevOps Engineer position in a cloud-native company.','DevOps Engineer','Cloud Systems',40000000.00,35000000.00,1,'Ho Chi Minh City, Ha Noi','Full-time','1 month','In 1 month',1,1,'IT'),('18',27,'profile18.jpg','cv18.pdf','Swift, iOS','4 years in mobile app development','Bachelor in Software Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1997-12-18','Male','Single','Vietnamese','iOS developer specializing in Swift and mobile application architecture.','Seeking iOS Developer role in a mobile-first company.','iOS Developer','iOS Tech',38000000.00,33000000.00,0,'Ho Chi Minh City','Full-time','2 months','In 2 months',1,1,'IT'),('2',11,'ims','cv2.pdf','Python, Django','3 years in back-end development','Bachelor in Information Technology','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1994-07-22','Female','Married','Vietnamese','Python enthusiast specializing in backend development and API design.','Looking to leverage Python skills in a dynamic backend development role.','Python Backend Developer','DataSoft Systems',30000000.00,25000000.00,0,'Ho Chi Minh City','Full-time','2 months','In 2 months',1,1,'IT'),('3',12,'profile3.jpg','cv3.pdf','React, CSS','1 year in full-stack development','Bachelor in Software Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1996-01-30','Male','Single','Vietnamese','Full-stack developer with expertise in React and modern web technologies.','Aiming to contribute as a Full-stack Developer in a progressive tech company.','Full Stack Developer','WebDev Solutions',28000000.00,23000000.00,1,'Ho Chi Minh City, Da Nang','Contract','2 weeks','Immediately',1,1,'IT'),('4',13,'profile4.jpg','cv4.pdf','PHP, Laravel','4 years in back-end development','Master in Computer Science','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1993-11-05','Female','Married','Vietnamese','Experienced PHP developer focusing on Laravel framework and database optimization.','Seeking a Senior PHP Developer position to lead complex web applications development.','Senior PHP Developer','PHP Solutions Ltd.',35000000.00,30000000.00,0,'Ho Chi Minh City','Full-time','3 months','In 3 months',1,1,'IT'),('5',8,'profile5.jpg','cv5.pdf','Java, Spring','2 years in back-end development','Bachelor in Computer Science','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1997-04-18','Male','Single','Vietnamese','Java developer with Spring framework expertise and microservices architecture experience.','Looking for opportunities to apply Java expertise in enterprise-level applications.','Java Developer','Java Enterprise Co.',27000000.00,22000000.00,1,'Ho Chi Minh City, Can Tho','Full-time','1 month','In 1 month',1,1,'IT'),('6',15,'profile6.jpg','cv6.pdf','C++, JavaScript','3 years in software development','Bachelor in Computer Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1995-09-25','Female','Single','Vietnamese','Software engineer with strong C++ background and JavaScript skills.','Seeking a role to utilize both C++ and web development skills.','Software Engineer','Software Systems Corp',32000000.00,27000000.00,1,'Ho Chi Minh City, Ha Noi','Full-time','1 month','In 1 month',1,1,'IT'),('7',7,'profile7.jpg','cv7.pdf','HTML, CSS, JavaScript','1 year in front-end development','Bachelor in Web Development','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1998-02-12','Male','Married','Vietnamese','Frontend specialist with focus on responsive design and user experience.','Aiming to create exceptional user experiences as a Frontend Developer.','Junior Frontend Developer','Web Frontiers',20000000.00,15000000.00,0,'Ho Chi Minh City','Full-time','2 weeks','Immediately',1,1,'IT'),('8',2,'profile8.jpg','cv8.pdf','Ruby, Rails','2 years in web development','Bachelor in Information Technology','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1994-06-08','Female','Single','Vietnamese','Ruby on Rails developer passionate about clean code and test-driven development.','Looking for a Ruby on Rails position in an agile development environment.','Ruby Developer','Ruby Technologies',28000000.00,23000000.00,1,'Ho Chi Minh City, Nha Trang','Freelance','Immediate','Immediately',1,1,'IT'),('9',1,'profile9.jpg','cv9.pdf','JavaScript, React','3 years in front-end development','Master in Web Engineering','Active','Sai Gon','2024-11-20 04:35:32','2024-11-20 04:35:32','1996-12-20','Male','Married','Vietnamese','React specialist with strong frontend architecture skills.','Seeking a Senior Frontend position focusing on React development.','Senior Frontend Developer','Frontend Masters Inc.',40000000.00,35000000.00,0,'Ho Chi Minh City','Full-time','2 months','In 2 months',1,1,'IT'),('cand-cpwzjfcvp',4,NULL,NULL,NULL,NULL,NULL,'Active','Sai Gon',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,1,0,'IT'),('cand-nudhd08mq',32,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1742091928/profile_pictures/user_cand-nudhd08mq_1742091925990.png',NULL,'JavaScript, React',NULL,NULL,'Active','Bắc Giang',NULL,NULL,NULL,NULL,'Married','VietNam',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,1,0,'IT'),('cand-tue39hyz3',33,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1744706963/profile_pictures/user_cand-tue39hyz3_1744706961383.png',NULL,NULL,NULL,NULL,'Active','Sai Gon',NULL,NULL,'2025-04-16','Female','Single','China','ê','TỂtrtertert','tẻtretert','Tech Solutions Inc.',1000000.00,346435645.00,0,'Ho Chi Minh City, Ha Noi','Full-time',NULL,NULL,1,1,'IT');
/*!40000 ALTER TABLE `candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `career_handbook`
--

DROP TABLE IF EXISTS `career_handbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `career_handbook` (
  `post_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `version` int DEFAULT '1',
  `isFeatured` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `career_handbook_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories_post` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `career_handbook`
--

LOCK TABLES `career_handbook` WRITE;
/*!40000 ALTER TABLE `career_handbook` DISABLE KEYS */;
INSERT INTO `career_handbook` VALUES ('1','How to Choose the Right Career Path','1','\n<div class=\"article-section\">\n  <h2>1. Giới thiệu</h2>\n  <p>Trong thời đại số hóa ngày nay, việc chọn đúng con đường sự nghiệp trở nên quan trọng hơn bao giờ hết. Bài viết này sẽ giúp bạn hiểu rõ hơn về cách xác định và phát triển sự nghiệp phù hợp với bản thân.</p>\n\n  <h2>2. Tự đánh giá bản thân</h2>\n  <p>Trước khi bắt đầu tìm kiếm con đường sự nghiệp, bạn cần hiểu rõ về:</p>\n  <ul>\n    <li><strong>Sở thích và đam mê:</strong> Xác định những hoạt động mà bạn thực sự yêu thích</li>\n    <li><strong>Kỹ năng:</strong> Đánh giá những điểm mạnh và điểm yếu của bản thân</li>\n    <li><strong>Giá trị cốt lõi:</strong> Xác định những giá trị quan trọng đối với bạn trong công việc</li>\n  </ul>\n\n  <h2>3. Nghiên cứu thị trường</h2>\n  <p>Sau khi hiểu rõ bản thân, bạn cần tìm hiểu về thị trường lao động:</p>\n  <ul>\n    <li>Xu hướng ngành nghề</li>\n    <li>Mức lương trung bình</li>\n    <li>Cơ hội thăng tiến</li>\n    <li>Yêu cầu kỹ năng và bằng cấp</li>\n  </ul>\n\n  <div class=\"info-box\">\n    <h3>Thống kê thị trường lao động 2024</h3>\n    <ul>\n      <li>Ngành IT: Tăng trưởng 25%</li>\n      <li>Digital Marketing: Tăng trưởng 20%</li>\n      <li>Data Analysis: Tăng trưởng 30%</li>\n    </ul>\n  </div>\n\n  <h2>4. Lập kế hoạch phát triển</h2>\n  <p>Một kế hoạch phát triển sự nghiệp tốt nên bao gồm:</p>\n  <ol>\n    <li>Mục tiêu ngắn hạn (1-2 năm)</li>\n    <li>Mục tiêu trung hạn (3-5 năm)</li>\n    <li>Mục tiêu dài hạn (5-10 năm)</li>\n  </ol>\n\n  <div class=\"quote-box\">\n    <blockquote>\n      \"Thành công trong sự nghiệp không phải là đích đến mà là một hành trình liên tục học hỏi và phát triển.\"\n    </blockquote>\n  </div>\n\n  <h2>5. Phát triển kỹ năng</h2>\n  <p>Để thành công trong sự nghiệp, bạn cần phát triển cả:</p>\n  <ul>\n    <li><strong>Kỹ năng chuyên môn:</strong>\n      <ul>\n        <li>Kiến thức chuyên ngành</li>\n        <li>Chứng chỉ nghề nghiệp</li>\n        <li>Công nghệ mới</li>\n      </ul>\n    </li>\n    <li><strong>Kỹ năng mềm:</strong>\n      <ul>\n        <li>Giao tiếp</li>\n        <li>Làm việc nhóm</li>\n        <li>Quản lý thời gian</li>\n        <li>Giải quyết vấn đề</li>\n      </ul>\n    </li>\n  </ul>\n\n  <div class=\"image-section\">\n    <img src=\"/images/career-path.jpg\" alt=\"Career Development Path\">\n    <p class=\"caption\">Lộ trình phát triển sự nghiệp điển hình</p>\n  </div>\n\n  <h2>6. Xây dựng mạng lưới quan hệ</h2>\n  <p>Networking là một phần quan trọng trong phát triển sự nghiệp. Bạn có thể:</p>\n  <ul>\n    <li>Tham gia các hội thảo chuyên ngành</li>\n    <li>Kết nối trên LinkedIn</li>\n    <li>Tham gia các nhóm nghề nghiệp</li>\n    <li>Tìm mentor trong ngành</li>\n  </ul>\n\n  <h2>7. Kết luận</h2>\n  <p>Chọn đúng con đường sự nghiệp là một quá trình dài hạn và cần nhiều nỗ lực. Hãy kiên nhẫn, linh hoạt và luôn sẵn sàng học hỏi điều mới.</p>\n\n  <div class=\"tips-box\">\n    <h3>Lời khuyên hữu ích:</h3>\n    <ul>\n      <li>Đừng ngại thử thách bản thân</li>\n      <li>Luôn cập nhật kiến thức mới</li>\n      <li>Xây dựng personal brand</li>\n      <li>Duy trì work-life balance</li>\n    </ul>\n  </div>\n</div>\n','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('10','Adapting to Changes in the Job Market','6','How to stay relevant in an evolving labor market.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,0),('11','How to Choose the Right Career Path','1','Tips and advice on selecting a suitable career path.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('12','Job Search Strategies That Work','2','Proven strategies to enhance your job search efforts.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('13','Understanding Compensation Packages','3','Details on evaluating salary, benefits, and bonuses.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('14','Industry-Specific Knowledge: IT Sector','4','A deep dive into IT industry trends and skills.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('15','Preparing for Your First Job','5','Essential tips for entering the workforce.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('16','Top Recruitment Trends in 2025','6','Analysis of current recruitment trends and predictions.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('17','How to Build Your Personal Brand','1','The importance of personal branding in career success.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('18','Networking Tips for Job Seekers','2','How to effectively network for career opportunities.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('19','Navigating Remote Work Compensation','3','Understanding salary structures for remote positions.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('2','Job Search Strategies That Work','2','Proven strategies to enhance your job search efforts.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0),('20','Adapting to Changes in the Job Market','6','How to stay relevant in an evolving labor market.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('21','Finding Your Passion at Work','1','How to discover and align your passion with your career.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('22','10 Resume Mistakes to Avoid','2','Common resume pitfalls and how to fix them.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('23','Negotiating Salary Effectively','3','Tips for securing the best compensation package.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('24','Mastering Technical Interviews','4','How to prepare for and excel in technical interviews.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('25','Transitioning from Student to Professional','5','Navigating the challenges of starting your first job.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('26','AI and the Future of Work','6','Exploring how AI is shaping the job market.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('27','Setting Career Goals That Stick','1','How to create and achieve meaningful career goals.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('28','Freelancing vs Full-Time Work','2','Weighing the pros and cons of freelancing and traditional employment.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('29','Understanding Employee Benefits','3','A guide to common workplace benefits and perks.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('3','Understanding Compensation Packages','3','Details on evaluating salary, benefits, and bonuses.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,0),('30','Building Your Professional Network','5','Strategies for expanding your connections in the industry.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('4','Industry-Specific Knowledge: IT Sector','4','A deep dive into IT industry trends and skills.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('5','Preparing for Your First Job','5','Essential tips for entering the workforce.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,1),('6','Top Recruitment Trends in 2025','6','Analysis of current recruitment trends and predictions.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('7','How to Build Your Personal Brand','1','The importance of personal branding in career success.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,1),('8','Networking Tips for Job Seekers','2','How to effectively network for career opportunities.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0),('9','Navigating Remote Work Compensation','3','Understanding salary structures for remote positions.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0);
/*!40000 ALTER TABLE `career_handbook` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `career_handbook_categories`
--

DROP TABLE IF EXISTS `career_handbook_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `career_handbook_categories` (
  `post_id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  PRIMARY KEY (`post_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `career_handbook_categories_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `career_handbook` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `career_handbook_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories_post` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `career_handbook_categories`
--

LOCK TABLES `career_handbook_categories` WRITE;
/*!40000 ALTER TABLE `career_handbook_categories` DISABLE KEYS */;
INSERT INTO `career_handbook_categories` VALUES ('1','1'),('11','1'),('17','1'),('7','1'),('11','2'),('12','2'),('18','2'),('2','2'),('8','2'),('13','3'),('19','3'),('3','3'),('9','3'),('14','4'),('4','4'),('15','5'),('5','5'),('10','6'),('16','6'),('20','6'),('6','6');
/*!40000 ALTER TABLE `career_handbook_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','Software Engineering','Category for software development jobs including back-end, front-end, and full-stack development.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25e912-ce9e-11ef-9430-2cf05db24bc7','Data Science','Category for jobs related to data analysis, machine learning, and artificial intelligence.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25ea73-ce9e-11ef-9430-2cf05db24bc7','Project Management','Category for project management roles in tech and non-tech industries.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','Marketing','Category for marketing roles including digital marketing, content creation, and brand management.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25ec4e-ce9e-11ef-9430-2cf05db24bc7','Graphic Design','Category for graphic design and UI/UX design roles.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25ed2a-ce9e-11ef-9430-2cf05db24bc7','Sales','Category for sales roles including account management and business development.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25ee06-ce9e-11ef-9430-2cf05db24bc7','Human Resources','Category for HR roles including recruitment, payroll, and employee relations.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25eec3-ce9e-11ef-9430-2cf05db24bc7','Customer Support','Category for customer support and customer service roles.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','Web Development','Category for web development jobs including front-end and back-end development.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f02b-ce9e-11ef-9430-2cf05db24bc7','Mobile Development','Category for mobile app development roles for iOS and Android platforms.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f0db-ce9e-11ef-9430-2cf05db24bc7','Cybersecurity','Category for cybersecurity roles including ethical hacking and information security.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f189-ce9e-11ef-9430-2cf05db24bc7','Business Analyst','Category for business analysis roles including data gathering, requirements analysis, and process improvement.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f23d-ce9e-11ef-9430-2cf05db24bc7','Finance','Category for finance roles including accounting, investment analysis, and financial planning.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f441-ce9e-11ef-9430-2cf05db24bc7','Consulting','Category for consulting roles in various industries including management, strategy, and IT consulting.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f6f2-ce9e-11ef-9430-2cf05db24bc7','Education','Category for education roles including teaching, tutoring, and training positions.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f861-ce9e-11ef-9430-2cf05db24bc7','Healthcare','Category for healthcare-related roles including medical, nursing, and administrative positions.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25f98c-ce9e-11ef-9430-2cf05db24bc7','Legal','Category for legal roles including lawyers, paralegals, and legal assistants.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25fb0c-ce9e-11ef-9430-2cf05db24bc7','Engineering','Category for engineering jobs including civil, mechanical, electrical, and chemical engineering.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25fc2b-ce9e-11ef-9430-2cf05db24bc7','Operations','Category for operational roles including supply chain management and logistics.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f25fd8e-ce9e-11ef-9430-2cf05db24bc7','Retail','Category for retail roles including store management, sales associates, and customer service in retail.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories_job`
--

DROP TABLE IF EXISTS `categories_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories_job` (
  `id` varchar(36) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `categories_job_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`),
  CONSTRAINT `categories_job_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `cv_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories_job`
--

LOCK TABLES `categories_job` WRITE;
/*!40000 ALTER TABLE `categories_job` DISABLE KEYS */;
INSERT INTO `categories_job` VALUES ('cat-job-001','1f29e210-ce9e-11ef-9430-2cf05db24bc7','pos-developer','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-002','1f29e210-ce9e-11ef-9430-2cf05db24bc7','pos-developer','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-003','1f29e210-ce9e-11ef-9430-2cf05db24bc7','pos-marketing','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-004','1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','pos-marketing','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-005','1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','pos-sales-exec','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-006','1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','pos-sales-exec','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-007','1f2a2488-ce9e-11ef-9430-2cf05db24bc7','pos-developer','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-008','1f2a2488-ce9e-11ef-9430-2cf05db24bc7','pos-developer','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-009','1f2a2488-ce9e-11ef-9430-2cf05db24bc7','pos-marketing','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cat-job-010','1f2a2abd-ce9e-11ef-9430-2cf05db24bc7','pos-marketing','2025-01-14 13:37:09','2025-01-14 13:37:09');
/*!40000 ALTER TABLE `categories_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories_post`
--

DROP TABLE IF EXISTS `categories_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories_post` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories_post`
--

LOCK TABLES `categories_post` WRITE;
/*!40000 ALTER TABLE `categories_post` DISABLE KEYS */;
INSERT INTO `categories_post` VALUES ('1','Định hướng nghề nghiệp','Hướng dẫn xây dựng và phát triển sự nghiệp.'),('2','Bí kíp tìm việc','Các mẹo và chiến lược để tìm kiếm việc làm hiệu quả.'),('3','Chế độ lương thưởng','Thông tin về lương thưởng và phúc lợi.'),('4','Kiến thức chuyên ngành','Cập nhật kiến thức trong các lĩnh vực chuyên môn.'),('5','Hành trang nghề nghiệp','Chuẩn bị kỹ năng và thái độ cho môi trường làm việc.'),('6','Thị trường và xu hướng tuyển dụng','Phân tích xu hướng tuyển dụng và thị trường lao động.');
/*!40000 ALTER TABLE `categories_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `company_id` varchar(36) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address` text,
  `website` varchar(255) DEFAULT NULL,
  `description` text,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `company_emp` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  `banner` varchar(255) DEFAULT NULL,
  `size` varchar(45) DEFAULT NULL,
  `plan` enum('Basic','Pro','ProMax') DEFAULT 'Basic',
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES ('1','TechCorp','123 Silicon Valley, CA','https://www.techcorp.com','A leading technology company','https://res.cloudinary.com/dh5cevmhm/image/upload/v1741425215/company_logos/company_8_1741425212535.jpg','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','500',1,NULL,'1000-2000 Nhân viên','Basic'),('10','FashionX','321 Style St, NY','https://www.fashionx.com','Fashion retail and online shopping','logo10.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','600',1,NULL,'500 - 600 Nhân viên','Basic'),('1f223c0f-ce9e-11ef-9430-2cf05db24bc7','TechRecruiters Inc.','123 Tech St, Silicon Valley','www.techrecruiters.com','Công ty ABC là doanh nghiệp hàng đầu trong lĩnh vực công nghệ, chuyên cung cấp giải pháp phần mềm và dịch vụ tư vấn CNTT. Được thành lập vào năm 2015, ABC không ngừng đổi mới để mang đến những sản phẩm chất lượng cao, đáp ứng nhu cầu của khách hàng trong và ngoài nước. Công ty hoạt động trong các lĩnh vực như phát triển ứng dụng web, di động, trí tuệ nhân tạo (AI) và điện toán đám mây. Với đội ngũ chuyên gia giàu kinh nghiệm, ABC cam kết cung cấp các giải pháp tối ưu giúp doanh nghiệp nâng cao hiệu suất và tối đa hóa lợi nhuận','https://res.cloudinary.com/dh5cevmhm/image/upload/v1741436536/company_logos/company_7_1741436532840.jpg','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin','John Doe',1,NULL,'300 Nhân viên','Basic'),('1f224ed5-ce9e-11ef-9430-2cf05db24bc7','JobsNow Ltd.','456 Jobs Ave, New York','www.jobsnow.com','Job listings company','https://res.cloudinary.com/dh5cevmhm/image/upload/v1741436536/company_logos/company_7_1741436532840.jpg','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin','Jane Smith',1,NULL,NULL,'Basic'),('2','HealthPlus','456 Medical St, NY','https://www.healthplus.com','Innovative healthcare solutions','logo2.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','300',1,NULL,NULL,'Basic'),('3','EduLearn','789 Education Blvd, TX','https://www.edulearn.com','Online learning platform','logo3.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','200',1,NULL,NULL,'Basic'),('4','GreenWorld','321 Green Rd, FL','https://www.greenworld.com','Eco-friendly products and services','logo4.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','150',1,NULL,NULL,'Basic'),('5','FoodiePro','654 Food Lane, CA','https://www.foodiepro.com','Gourmet food delivery service','logo5.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','100',1,NULL,NULL,'Basic'),('6','FinTech Solutions','987 Financial Ave, NY','https://www.fintech.com','Innovative financial technologies','logo6.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','250',1,NULL,NULL,'Basic'),('7','AutoBikedSmartHomezarrr','11, Hồ Chí Minh','https://www.smarthome.com','Smart home devices and servicesss','https://res.cloudinary.com/dh5cevmhm/image/upload/v1744609552/company_logos/company_7_1744609549756.jpg','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','799',1,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1744609571/company_banners/company_7_1744609569664.jpg',NULL,'Basic'),('8','SmartHome','456 Home Ave, CA','https://www.smarthome.com','Smart home devices and services','https://res.cloudinary.com/dh5cevmhm/image/upload/v1742459420/company_logos/company_8_1742459418985.jpg','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','400',1,'https://res.cloudinary.com/dh5cevmhm/image/upload/v1742459421/company_banners/company_8_1742459421645.jpg',NULL,'Pro'),('9','CyberTech','789 Cyber Rd, TX','https://www.cybertech.com','Cybersecurity and tech consulting','logo9.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','350',1,NULL,NULL,'ProMax');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bot_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `completed_at` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `updated_at` datetime DEFAULT NULL,
  `last_error` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` int NOT NULL,
  `content` longtext COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `bot_id` (`bot_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversations_chk_1` CHECK (json_valid(`last_error`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cv_categories`
--

DROP TABLE IF EXISTS `cv_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cv_categories` (
  `category_id` varchar(36) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_icon` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cv_categories`
--

LOCK TABLES `cv_categories` WRITE;
/*!40000 ALTER TABLE `cv_categories` DISABLE KEYS */;
INSERT INTO `cv_categories` VALUES ('cat-it','Công nghệ thông tin','it-icon.png',3,1),('cat-marketing','Marketing, Truyền thông','marketing-icon.png',2,1),('cat-sales','Kinh doanh / Bán hàng','sales-icon.png',1,1),('pos-developer','Kỹ sư phần mềm','developer-icon.png',1,1),('pos-marketing','Chuyên viên Marketing','marketing-exec-icon.png',1,1),('pos-sales-exec','Nhân viên bán hàng','sales-exec-icon.png',1,1),('pos-sales-manager','Giám đốc kinh doanh','sales-manager-icon.png',2,1);
/*!40000 ALTER TABLE `cv_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cv_field_values`
--

DROP TABLE IF EXISTS `cv_field_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cv_field_values` (
  `value_id` varchar(36) NOT NULL,
  `cv_id` varchar(36) NOT NULL,
  `field_id` varchar(36) NOT NULL,
  `field_value` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`value_id`),
  KEY `cv_id` (`cv_id`),
  KEY `field_id` (`field_id`),
  CONSTRAINT `cv_field_values_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `user_cvs` (`cv_id`),
  CONSTRAINT `cv_field_values_ibfk_2` FOREIGN KEY (`field_id`) REFERENCES `template_fields` (`field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cv_field_values`
--

LOCK TABLES `cv_field_values` WRITE;
/*!40000 ALTER TABLE `cv_field_values` DISABLE KEYS */;
INSERT INTO `cv_field_values` VALUES ('val-001','cv-user-003','tf-010-01','Nguyễn Đức Vĩ','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-002','cv-user-003','tf-010-02','Software Engineer','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-003','cv-user-003','tf-010-03','Experienced software engineer with 5+ years in full-stack development','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-004','cv-user-003','tf-010-04','(024) 6680 5588','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-005','cv-user-003','tf-010-05','john.doe@email.com','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-006','cv-user-003','tf-010-06','github.com/johndoe','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-007','cv-user-003','tf-010-07','Quận A, Hà Nội','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-008','cv-user-003','tf-010-08','08/2020','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-009','cv-user-003','tf-010-09','08/2022','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-010','cv-user-003','tf-010-10','Senior Software Engineer','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-011','cv-user-003','tf-010-11','Tech Corp','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-012','cv-user-003','tf-010-12','• Led development of microservices architecture\n• Managed team of 5 developers','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-013','cv-user-003','tf-010-18','Đại học Bách Khoa','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-014','cv-user-003','tf-010-19','Kỹ sư Phần mềm','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-015','cv-user-003','tf-010-20','09/2015','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-016','cv-user-003','tf-010-21','06/2019','2024-01-15 10:00:00','2024-01-15 10:00:00'),('val-017','cv-user-003','tf-010-23','JavaScript\nReact\nNode.js\nPython\nSQL','2024-01-15 10:00:00','2024-01-15 10:00:00');
/*!40000 ALTER TABLE `cv_field_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cv_templates`
--

DROP TABLE IF EXISTS `cv_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cv_templates` (
  `template_id` varchar(36) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `template_description` text,
  `template_html` text NOT NULL,
  `template_css` text,
  `template_thumbnail` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  PRIMARY KEY (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cv_templates`
--

LOCK TABLES `cv_templates` WRITE;
/*!40000 ALTER TABLE `cv_templates` DISABLE KEYS */;
INSERT INTO `cv_templates` VALUES ('cvtest','Basic CV Template','Mẫu CV cơ bản phù hợp cho mọi ngành nghề','<div class=\"cv-container\">\n  <header class=\"cv-header\">\n    <div class=\"profile-image\">{{profile_image}}</div>\n    <div class=\"basic-info\">\n      <h1>{{fullname}}</h1>\n      <h2>{{job_title}}</h2>\n    </div>\n  </header>\n\n  <section class=\"contact-info\">\n    <div class=\"info-item\"><i class=\"fas fa-envelope\"></i>{{email}}</div>\n    <div class=\"info-item\"><i class=\"fas fa-phone\"></i>{{phone}}</div>\n    <div class=\"info-item\"><i class=\"fas fa-map-marker\"></i>{{address}}</div>\n    <div class=\"info-item\"><i class=\"fab fa-linkedin\"></i>{{linkedin}}</div>\n  </section>\n\n  <main class=\"cv-content\">\n    <section class=\"profile\">\n      <h3>Giới thiệu bản thân</h3>\n      <p>{{profile_summary}}</p>\n    </section>\n\n    <section class=\"experience\">\n      <h3>Kinh nghiệm làm việc</h3>\n      {{#each experiences}}\n      <div class=\"exp-item\">\n        <div class=\"exp-header\">\n          <h4>{{company_name}}</h4>\n          <span class=\"duration\">{{start_date}} - {{end_date}}</span>\n        </div>\n        <div class=\"position\">{{position}}</div>\n        <ul class=\"responsibilities\">\n          {{#each responsibilities}}\n          <li>{{this}}</li>\n          {{/each}}\n        </ul>\n      </div>\n      {{/each}}\n    </section>\n\n    <section class=\"education\">\n      <h3>Học vấn</h3>\n      {{#each education}}\n      <div class=\"edu-item\">\n        <h4>{{school}}</h4>\n        <div class=\"degree\">{{degree}}</div>\n        <div class=\"duration\">{{start_year}} - {{end_year}}</div>\n        <div class=\"gpa\">GPA: {{gpa}}</div>\n      </div>\n      {{/each}}\n    </section>\n\n    <section class=\"skills\">\n      <h3>Kỹ năng</h3>\n      <div class=\"skills-grid\">\n        {{#each skills}}\n        <div class=\"skill-item\">\n          <span class=\"skill-name\">{{name}}</span>\n          <div class=\"skill-level\">{{level}}</div>\n        </div>\n        {{/each}}\n      </div>\n    </section>\n  </main>\n</div>','.cv-container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 40px;\n  font-family: \"Arial\", sans-serif;\n  color: #333;\n  background: #fff;\n  box-shadow: 0 0 20px rgba(0,0,0,0.1);\n  magin-top : 100px;\n}\n\n.cv-header {\n  display: flex;\n  align-items: center;\n  margin-bottom: 30px;\n}\n\n.profile-image {\n  width: 150px;\n  height: 150px;\n  border-radius: 50%;\n  overflow: hidden;\n  margin-right: 30px;\n}\n\n.basic-info h1 {\n  font-size: 2.5em;\n  color: #2c3e50;\n  margin: 0;\n}\n\n.basic-info h2 {\n  font-size: 1.5em;\n  color: #7f8c8d;\n  margin: 10px 0;\n}\n\n.contact-info {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 15px;\n  margin-bottom: 30px;\n}\n\n.info-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\nsection {\n  margin-bottom: 30px;\n}\n\nh3 {\n  color: #2c3e50;\n  border-bottom: 2px solid #3498db;\n  padding-bottom: 10px;\n  margin-bottom: 20px;\n}\n\n.exp-item, .edu-item {\n  margin-bottom: 20px;\n}\n\n.skills-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 15px;\n}\n\n.skill-item {\n  background: #f8f9fa;\n  padding: 10px;\n  border-radius: 5px;\n}','basic_template_thumb.png',1,'2025-01-24 20:29:01','admin',1),('e3e5aaab-da55-11ef-b243-2cf05db24bc7','Basic CVs','Mẫu CV cơ bản phù hợp cho mọi ngành nghề','<div class=\"cv-container\">\n  <div class=\"header\">{{name}}</div>\n  <div class=\"contact\">{{contact}}</div>\n  <div class=\"education\">{{education}}</div>\n  <div class=\"experience\">{{experience}}</div>\n  <div class=\"skills\">{{skills}}</div>\n</div>','.cv-container {max-width: 800px; margin: 0 auto;}\n.header {font-size: 24px; font-weight: bold;}\n.contact {margin: 10px 0;}\n.education, .experience, .skills {margin: 20px 0;}','basic_cv_thumb.png',1,'2025-01-24 20:19:50','admin',1),('e3e643a7-da55-11ef-b243-2cf05db24bc7','Professional CV','Mẫu CV chuyên nghiệp cho các vị trí quản lý','<div class=\"cv-pro\">\n  <header>{{name}}</header>\n  <section class=\"profile\">{{profile}}</section>\n  <section class=\"work\">{{work}}</section>\n  <section class=\"education\">{{education}}</section>\n</div>','.cv-pro {width: 100%; max-width: 1000px;}\nheader {background: #2c3e50; color: white; padding: 20px;}\nsection {margin: 15px; padding: 20px;}','pro_cv_thumb.png',1,'2025-01-24 20:19:50','admin',1),('e3e658d7-da55-11ef-b243-2cf05db24bc7','Creative CV','Mẫu CV sáng tạo cho ngành thiết kế và nghệ thuật','<div class=\"creative-cv\">\n  <div class=\"sidebar\">{{profile}}</div>\n  <main>{{content}}</main>\n</div>','.creative-cv {display: grid; grid-template-columns: 30% 70%;}\n.sidebar {background: #f1c40f;}\nmain {padding: 20px;}','creative_cv_thumb.png',1,'2025-01-24 20:19:50','admin',1),('f4678296-da56-11ef-b243-2cf05db24bc7','Basic CV Template','Mẫu CV cơ bản phù hợp cho mọi ngành nghề','<div class=\"cv-container\">\n  <header class=\"cv-header\">\n    <div class=\"profile-image\">{{profile_image}}</div>\n    <div class=\"basic-info\">\n      <h1>{{fullname}}</h1>\n      <h2>{{job_title}}</h2>\n    </div>\n  </header>\n\n  <section class=\"contact-info\">\n    <div class=\"info-item\"><i class=\"fas fa-envelope\"></i>{{email}}</div>\n    <div class=\"info-item\"><i class=\"fas fa-phone\"></i>{{phone}}</div>\n    <div class=\"info-item\"><i class=\"fas fa-map-marker\"></i>{{address}}</div>\n    <div class=\"info-item\"><i class=\"fab fa-linkedin\"></i>{{linkedin}}</div>\n  </section>\n\n  <main class=\"cv-content\">\n    <section class=\"profile\">\n      <h3>Giới thiệu bản thân</h3>\n      <p>{{profile_summary}}</p>\n    </section>\n\n    <section class=\"experience\">\n      <h3>Kinh nghiệm làm việc</h3>\n      {{#each experiences}}\n      <div class=\"exp-item\">\n        <div class=\"exp-header\">\n          <h4>{{company_name}}</h4>\n          <span class=\"duration\">{{start_date}} - {{end_date}}</span>\n        </div>\n        <div class=\"position\">{{position}}</div>\n        <ul class=\"responsibilities\">\n          {{#each responsibilities}}\n          <li>{{this}}</li>\n          {{/each}}\n        </ul>\n      </div>\n      {{/each}}\n    </section>\n\n    <section class=\"education\">\n      <h3>Học vấn</h3>\n      {{#each education}}\n      <div class=\"edu-item\">\n        <h4>{{school}}</h4>\n        <div class=\"degree\">{{degree}}</div>\n        <div class=\"duration\">{{start_year}} - {{end_year}}</div>\n        <div class=\"gpa\">GPA: {{gpa}}</div>\n      </div>\n      {{/each}}\n    </section>\n\n    <section class=\"skills\">\n      <h3>Kỹ năng</h3>\n      <div class=\"skills-grid\">\n        {{#each skills}}\n        <div class=\"skill-item\">\n          <span class=\"skill-name\">{{name}}</span>\n          <div class=\"skill-level\">{{level}}</div>\n        </div>\n        {{/each}}\n      </div>\n    </section>\n  </main>\n</div>','.cv-container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 40px;\n  font-family: \"Arial\", sans-serif;\n  color: #333;\n  background: #fff;\n  box-shadow: 0 0 20px rgba(0,0,0,0.1);\n  magin-top : 100px;\n}\n\n.cv-header {\n  display: flex;\n  align-items: center;\n  margin-bottom: 30px;\n}\n\n.profile-image {\n  width: 150px;\n  height: 150px;\n  border-radius: 50%;\n  overflow: hidden;\n  margin-right: 30px;\n}\n\n.basic-info h1 {\n  font-size: 2.5em;\n  color: #2c3e50;\n  margin: 0;\n}\n\n.basic-info h2 {\n  font-size: 1.5em;\n  color: #7f8c8d;\n  margin: 10px 0;\n}\n\n.contact-info {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 15px;\n  margin-bottom: 30px;\n}\n\n.info-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\nsection {\n  margin-bottom: 30px;\n}\n\nh3 {\n  color: #2c3e50;\n  border-bottom: 2px solid #3498db;\n  padding-bottom: 10px;\n  margin-bottom: 20px;\n}\n\n.exp-item, .edu-item {\n  margin-bottom: 20px;\n}\n\n.skills-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 15px;\n}\n\n.skill-item {\n  background: #f8f9fa;\n  padding: 10px;\n  border-radius: 5px;\n}','basic_template_thumb.png',1,'2025-01-24 20:27:27','admin',1),('template-basic-01','CV Cơ bản','Mẫu CV đơn giản, chuyên nghiệp phù hợp mọi ngành nghề','<div id=\"section-header\">','\n.cv-template-basic {\nmagin-top: 50px,\n  padding: 40px;\n  font-family: Arial, sans-serif;\n  color: #333;\n  background: white;\n\n  .cv-header {\n    display: flex;\n    justify-content: space-between;\n    margin-bottom: 30px;\n    \n    .header-content {\n      flex: 1;\n      \n      .fullname {\n        font-size: 32px;\n        color: #013a74;\n        font-weight: bold;\n        margin-bottom: 10px;\n      }\n      \n      .title {\n        font-size: 18px;\n        color: #333;\n        margin-bottom: 15px;\n        padding-bottom: 5px;\n        border-bottom: 2px solid #013a74;\n        display: inline-block;\n      }\n      \n      .objective {\n        color: #666;\n        line-height: 1.6;\n      }\n    }\n    \n    .avatar-container {\n      width: 150px;\n      height: 150px;\n      margin-left: 30px;\n      \n      .avatar {\n        width: 100%;\n        height: 100%;\n        border-radius: 50%;\n        background: #f0f0f0;\n      }\n    }\n  }\n\n  .personal-info {\n    background: #f8f9fa;\n    padding: 15px;\n    margin-bottom: 30px;\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 10px;\n    \n    .info-item {\n      display: flex;\n      align-items: center;\n      gap: 10px;\n      color: #666;\n      \n      i {\n        color: #013a74;\n      }\n    }\n  }\n\n  section {\n    margin-bottom: 25px;\n    \n    h2 {\n      color: #013a74;\n      font-size: 18px;\n      font-weight: bold;\n      margin-bottom: 15px;\n      padding-bottom: 5px;\n      border-bottom: 2px solid rgba(1, 58, 116, 0.1);\n    }\n    \n    .content {\n      color: #444;\n      line-height: 1.6;\n    }\n  }\n\n  .experience-item {\n    margin-bottom: 20px;\n    \n    .period {\n      color: #02a346;\n      font-weight: 500;\n      margin-bottom: 5px;\n    }\n    \n    .position {\n      font-weight: bold;\n      margin-bottom: 5px;\n    }\n    \n    .company {\n      color: #666;\n      margin-bottom: 10px;\n    }\n    \n    .responsibilities {\n      padding-left: 20px;\n      \n      li {\n        margin-bottom: 5px;\n      }\n    }\n  }\n\n  .skills-list {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n    gap: 15px;\n  }\n}\n','basic-template-thumb.png',1,'2025-01-14 13:36:32','admin',1),('template-basic-010','CV Cơ bảnquá','Mẫu CV đơn giản, chuyên nghiệp phù hợp mọi ngành nghề','\n<div class=\"cv-container\">\n  <header class=\"cv-header\">\n    <div class=\"personal-info\">\n      <h1>{{fullName}}</h1>\n      <p class=\"job-title\">{{jobTitle}}</p>\n      <p class=\"job-description\">{{jobDescription}}</p>\n      <div class=\"contact-info\">\n        <div class=\"contact-item\">\n          <i class=\"fas fa-phone\"></i>\n          <span>{{phone}}</span>\n        </div>\n        <div class=\"contact-item\">\n          <i class=\"fas fa-envelope\"></i>\n          <span>{{email}}</span>\n        </div>\n        <div class=\"contact-item\">\n          <i class=\"fas fa-globe\"></i>\n          <span>{{website}}</span>\n        </div>\n        <div class=\"contact-item\">\n          <i class=\"fas fa-map-marker-alt\"></i>\n          <span>{{address}}</span>\n        </div>\n      </div>\n    </div>\n    <div class=\"avatar-placeholder\"></div>\n  </header>\n\n  <section class=\"experience-section\">\n    <h2>KINH NGHIỆM LÀM VIỆC</h2>\n    <div class=\"timeline\">\n      <div class=\"timeline-item\">\n        <div class=\"date-range\">\n          <span>{{startDate}} - {{endDate}}</span>\n        </div>\n        <div class=\"timeline-content\">\n          <h3>{{jobTitle}}</h3>\n          <p class=\"company\">{{company}}</p>\n          <ul class=\"work-description\">\n            {{#each workDescriptionItems}}\n              <li>{{this}}</li>\n            {{/each}}\n          </ul>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <div class=\"three-column-section\">\n    <section class=\"education-section\">\n      <h2>HỌC VẤN</h2>\n      <p class=\"school\">{{schoolName}}</p>\n      <p class=\"major\">{{major}}</p>\n      <p class=\"edu-period\">{{eduStartDate}} - {{eduEndDate}}</p>\n      <p class=\"description\">{{educationDescription}}</p>\n    </section>\n\n    <section class=\"skills-section\">\n      <h2>CÁC KỸ NĂNG</h2>\n      <ul class=\"skills-list\">\n        {{#each skills}}\n          <li>{{this}}</li>\n        {{/each}}\n      </ul>\n    </section>\n\n    <section class=\"certificates-section\">\n      <h2>CHỨNG CHỈ</h2>\n      <div class=\"certificate-item\">\n        <span class=\"date\">{{certificateDate}}</span>\n        <p class=\"name\">{{certificateName}}</p>\n      </div>\n    </section>\n  </div>\n</div>','\n.cv-container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 40px;\n  font-family: Arial, sans-serif;\n  background: $background-color;\n  color: #333;\n  line-height: 1.6;\n}\n\n.cv-header {\n  display: flex;\n  justify-content: space-between;\n  margin-bottom: 30px;\n  padding-bottom: 20px;\n  border-bottom: 1px solid #eee;\n}\n\n.personal-info {\n  flex: 1;\n}\n\nh1 {\n  font-size: 28px;\n  color: $primary-color;\n  margin-bottom: 8px;\n}\n\n.job-title {\n  font-size: 16px;\n  color: #666;\n  margin-bottom: 12px;\n}\n\n.contact-info {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 8px;\n  margin-top: 16px;\n}\n\n.contact-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  color: #666;\n  font-size: 14px;\n}\n\n.avatar-placeholder {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  background: #eee;\n  margin-left: 40px;\n}\n\nh2 {\n  color: $primary-color;\n  font-size: 18px;\n  margin-bottom: 16px;\n  padding-bottom: 8px;\n  border-bottom: 2px solid $primary-color;\n}\n\n.timeline-item {\n  display: flex;\n  margin-bottom: 24px;\n  position: relative;\n}\n\n.date-range {\n  width: 120px;\n  color: #666;\n  font-size: 14px;\n}\n\n.timeline-content {\n  flex: 1;\n  padding-left: 24px;\n  border-left: 2px solid #eee;\n}\n\n.work-description {\n  margin-top: 12px;\n  padding-left: 16px;\n}\n\n.work-description li {\n  margin-bottom: 6px;\n  position: relative;\n}\n\n.work-description li:before {\n  content: \"\";\n  position: absolute;\n  left: -16px;\n  top: 8px;\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  background: $primary-color;\n}\n\n.three-column-section {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 30px;\n  margin-top: 40px;\n}\n\n@media (max-width: 768px) {\n  .three-column-section {\n    grid-template-columns: 1fr;\n  }\n  \n  .cv-header {\n    flex-direction: column;\n    text-align: center;\n  }\n  \n  .avatar-placeholder {\n    margin: 20px auto;\n  }\n  \n  .contact-info {\n    grid-template-columns: 1fr;\n  }\n}\n','basic-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-basic-02','Thanh lịch','Mẫu CV thanh lịch với layout cân đối','...','...','basic-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-01','CV Sáng tạo','Mẫu CV hiện đại dành cho ngành sáng tạo','<div class=\"creative-cv\">\n    <aside class=\"sidebar\">{{profile}} {{contact}}</aside>\n    <main class=\"content\">{{sections}}</main>\n</div>','.creative-cv {display: grid; grid-template-columns: 30% 70%}\n.sidebar {background: #2c3e50; color: white}','creative-template-thumb.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-010','CV Sáng tạo','Mẫu CV hiện đại dành cho ngành sáng tạo','...','...','creative-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-02','Sáng tạo Pink','Mẫu CV màu hồng cho ngành sáng tạo','...','...','creative-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-03','Sáng tạo Blue','Mẫu CV xanh dương hiện đại','...','...','creative-template-03.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-01','Tối giản','Mẫu CV tối giản với thiết kế hiện đại','\n<div class=\"cv-modern-1\">\n  <div class=\"sidebar\">\n    <div class=\"avatar\">{{avatar}}</div>\n    <div class=\"contact-info\">\n      <div class=\"info-item\">{{email}}</div>\n      <div class=\"info-item\">{{phone}}</div>\n      <div class=\"info-item\">{{address}}</div>\n    </div>\n    <div class=\"skills-section\">\n      <h3>KỸ NĂNG</h3>\n      {{skills}}\n    </div>\n  </div>\n\n  <div class=\"main-content\">\n    <div class=\"header\">\n      <h1>{{fullname}}</h1>\n      <div class=\"title\">{{title}}</div>\n    </div>\n\n    <div class=\"section\">\n      <h2>KINH NGHIỆM LÀM VIỆC</h2>\n      {{experience}}\n    </div>\n\n    <div class=\"section\">\n      <h2>HỌC VẤN</h2> \n      {{education}}\n    </div>\n  </div>\n</div>\n','...','modern-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-02','Hiện đại 1','CV hiện đại với cách bố trí thông minh','...','...','modern-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-03','Tinh tế 2','Mẫu CV tinh tế phù hợp nhiều vị trí','...','...','modern-template-03.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-04','Hiện đại 4','CV hiện đại với điểm nhấn màu sắc','...','...','modern-template-04.png',1,'2025-01-14 13:36:32','admin',1),('template-test-01','CV Cơ bản  của vĩ','Mẫu CV đơn giản, chuyên nghiệp phù hợp cho mọi ngành nghề','<div class=\"cv-container\">\r   <div class=\"header\">\r     <h1>{{fullname}}</h1>\r     <h2>{{title}}</h2>\r     <div class=\"contact-info\">\r       <p>{{email}} | {{phone}}</p>\r       <p>{{address}}</p>\r     </div>\r   </div>\r   <div class=\"main\">\r     <div class=\"section\">\r       <h3>Học vấn</h3>\r       {{education}}\r     </div>\r     <div class=\"section\">\r       <h3>Kinh nghiệm làm việc</h3>\r       {{experience}} \r     </div>\r     <div class=\"section\">\r       </div>\r   </div>\r </div>','/* CSS cho template */\n.cv-container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 40px;\n  font-family: Arial, sans-serif;\n}\n\n.header {\n  text-align: center;\n  margin-bottom: 40px;\n}\n\n.header h1 {\n  color: #2d2d2d;\n  margin: 0;\n  font-size: 32px;\n}\n\n.header h2 {\n  color: #666;\n  margin: 8px 0;\n  font-size: 20px;\n}\n\n.contact-info {\n  color: #666;\n  font-size: 14px;\n}\n\n.section {\n  margin-bottom: 30px;\n}\n\n.section h3 {\n  color: #013a74;\n  border-bottom: 2px solid #013a74;\n  padding-bottom: 8px;\n  margin-bottom: 16px;\n}','template-test-01-thumb.png',1,'2025-01-24 21:32:10','admin',1);
/*!40000 ALTER TABLE `cv_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gift_codes`
--

DROP TABLE IF EXISTS `gift_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gift_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `amount` bigint NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gift_codes`
--

LOCK TABLES `gift_codes` WRITE;
/*!40000 ALTER TABLE `gift_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `gift_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `interview_id` varchar(36) NOT NULL,
  `application_id` varchar(36) NOT NULL,
  `interview_status` enum('Chờ','Hoàn thành','Đã hủy') DEFAULT 'Chờ',
  `interview_date` datetime(6) DEFAULT NULL,
  `interview_result` enum('Đậu','Trượt','Chưa phỏng vấn') DEFAULT 'Chưa phỏng vấn',
  `feedback` text,
  `interview_link` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  PRIMARY KEY (`interview_id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_applications`
--

DROP TABLE IF EXISTS `job_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applications` (
  `application_id` varchar(36) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `status` enum('Đang xét duyệt','Chờ phỏng vấn','Đã phỏng vấn','Đạt phỏng vấn','Đã nhận','Đã từ chối','Hết hạn') DEFAULT 'Đang xét duyệt',
  `applied_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  KEY `job_id` (`job_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE,
  CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_applications`
--

LOCK TABLES `job_applications` WRITE;
/*!40000 ALTER TABLE `job_applications` DISABLE KEYS */;
INSERT INTO `job_applications` VALUES ('10','1f2d87c0-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đạt phỏng vấn','2025-02-23 22:26:39','2025-01-09 22:26:39'),('11','1f2d8edd-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Chờ phỏng vấn','2025-02-23 22:26:39','2025-01-09 22:26:39'),('4','1f2a2488-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đã từ chối',NULL,NULL),('5','1f2a2488-ce9e-11ef-9430-2cf05db24bc7',2,'resume_1.pdf','Đã nhận',NULL,NULL),('6','1f2da3fc-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đã nhận','2025-02-23 22:26:39','2025-01-09 22:26:39'),('7','1f2d9e91-ce9e-11ef-9430-2cf05db24bcd',1,'resume_1.pdf','Đang xét duyệt','2025-02-23 22:26:39','2025-01-09 22:26:39'),('8','1f2d9e91-ce9e-11ef-9430-2cf05db24bcd',2,'resume_1.pdf','Đang xét duyệt','2025-02-23 22:26:39','2025-01-09 22:26:39'),('9','1f2d82a5-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Hết hạn','2025-02-23 22:26:39','2025-01-09 22:26:39'),('app-23puft7qa','1f2a335b-ce9e-11ef-9430-2cf05db24bc7',5,NULL,'Đang xét duyệt','2025-03-02 01:54:36',NULL),('app-4qnwknp8d','1f2a19fb-ce9e-11ef-9430-2cf05db24bc7',5,NULL,'Đang xét duyệt','2025-04-24 09:22:58',NULL),('app-6w3mwh7se','1f2d9e91-ce9e-11ef-9430-2cf05db24bc7',3,NULL,'Đang xét duyệt','2025-04-27 08:14:08',NULL),('app-9ry6x0zgb','1f29e210-ce9e-11ef-9430-2cf05db24bc7',3,NULL,'Đang xét duyệt','2025-04-27 08:28:31',NULL),('app-cy68znltn','1f2a1511-ce9e-11ef-9430-2cf05db24bc7',5,NULL,'Đang xét duyệt','2025-03-02 01:41:25',NULL),('app-esipys499','1f2a36f4-ce9e-11ef-9430-2cf05db24bc7',5,NULL,'Đang xét duyệt','2025-03-14 09:48:10',NULL),('app-xm4vnlvlx','1f2d9e91-ce9e-11ef-9430-2cf05db24bcd',7,NULL,'Đang xét duyệt','2025-03-02 08:50:53',NULL),('app-ybjj5hgme','1f2d9e91-ce9e-11ef-9430-2cf05db24bcd',5,NULL,'Chờ phỏng vấn','2025-03-11 08:32:44',NULL),('app-z4nycu0qg','1f2a2488-ce9e-11ef-9430-2cf05db24bc7',33,NULL,'Đang xét duyệt','2025-04-15 09:15:37',NULL);
/*!40000 ALTER TABLE `job_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_skills`
--

DROP TABLE IF EXISTS `job_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skills` (
  `job_id` varchar(36) NOT NULL,
  `skill_id` varchar(36) NOT NULL,
  PRIMARY KEY (`job_id`,`skill_id`),
  KEY `skill_id` (`skill_id`),
  CONSTRAINT `job_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE,
  CONSTRAINT `job_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_skills`
--

LOCK TABLES `job_skills` WRITE;
/*!40000 ALTER TABLE `job_skills` DISABLE KEYS */;
INSERT INTO `job_skills` VALUES ('1f29e210-ce9e-11ef-9430-2cf05db24bc7','1f366a6b-ce9e-11ef-9430-2cf05db24bc7'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','1f366a6b-ce9e-11ef-9430-2cf05db24bc7'),('1f29e210-ce9e-11ef-9430-2cf05db24bc7','1f36858f-ce9e-11ef-9430-2cf05db24bc7'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','1f36858f-ce9e-11ef-9430-2cf05db24bc7'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','1f368875-ce9e-11ef-9430-2cf05db24bc7'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','1f368875-ce9e-11ef-9430-2cf05db24bc7'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','1f3689ba-ce9e-11ef-9430-2cf05db24bc7'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','1f3689ba-ce9e-11ef-9430-2cf05db24bc7');
/*!40000 ALTER TABLE `job_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `job_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `salary` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `benefits` text,
  `job_requirements` text,
  `working_time` varchar(255) DEFAULT NULL,
  `working_location` varchar(255) DEFAULT NULL,
  `status` enum('Active','Closed','Pending') DEFAULT 'Pending',
  `company_id` varchar(36) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `deadline` datetime(6) DEFAULT NULL,
  `job_embedding` text,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  `quantity` int DEFAULT '2',
  `rank` varchar(45) DEFAULT 'Quản lý / Giám sát',
  `education` varchar(45) DEFAULT 'Đại Học trở lên',
  PRIMARY KEY (`job_id`),
  KEY `company_id` (`company_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES ('1f29e210-ce9e-11ef-9430-2cf05db24bc7','Software duc','Develop and maintain software applications for various platforms. Collaborate with teams to design and implement new features.','Dưới 10 triệu','New York, NY','Dưới 1 năm','Health Insurance, 401k','Proficient in JavaScript, React, Node.js','Toàn thời gian','Remote','Pending','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Cấp 3 trở lên'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','Data Scientist','Analyze data to provide insights and drive decision-making. Work with machine learning models and algorithms.','Dưới 10 triệu','San Francisco, CA','2 năm','Health Insurance, Paid Time Off','Proficient in Python, R, and machine learning algorithms','Toàn thời gian','On-site','Pending','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e912-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,1,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a19fb-ce9e-11ef-9430-2cf05db24bc7','Project Manager','Lead projects from inception to completion. Manage teams, timelines, and client expectations.','Dưới 10 triệu','Los Angeles, CA','3 năm','Health Insurance, 401k, Bonuses','Experience in project management tools, excellent communication skills','Toàn thời gian','Hybrid','Closed','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ea73-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,48,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','Marketing Specialist','Develop and execute marketing strategies to promote our brand and products.','Dưới 10 triệu','Austin, TX','5 năm','Health Insurance, Paid Time Off','Experience with SEO, digital marketing, and social media platforms','Toàn thời gian','Remote','Pending','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-16 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,5,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a2488-ce9e-11ef-9430-2cf05db24bc7','Sales Executive','Identify and build relationships with potential clients. Close deals and achieve sales targets.','Dưới 10 triệu','12, Hồ Chí Minh','4 năm','Commission-based, Health Insurance','Excellent communication and negotiation skills','Toàn thời gian','Hybrid','Closed','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ed2a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a2abd-ce9e-11ef-9430-2cf05db24bc7','UX Designer','Create user-centered designs for digital products. Work closely with developers and product managers.','Dưới 10 triệu','Seattle, WA','1 năm','Health Insurance, 401k','Proficient in Figma, Sketch, and wireframing tools','Bán thời gian','Remote','Pending','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ec4e-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,4,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a3006-ce9e-11ef-9430-2cf05db24bc7','Human Resources Specialist','Manage recruitment, employee relations, and payroll functions.','Dưới 10 triệu','Boston, MA','1 năm','Health Insurance, Paid Leave','Strong knowledge of HR software and labor laws','Bán thời gian','On-site','Closed','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ee06-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a335b-ce9e-11ef-9430-2cf05db24bc7','Customer Support Representative','Provide customer support via email, chat, and phone. Resolve customer issues and queries.','Dưới 10 triệu','Phoenix, AZ','Không yêu cầu','Health Insurance, Paid Time Off','Strong communication skills, experience with CRM systems','Bán thời gian','Hybrid','Pending','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eec3-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-02-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,4,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a36f4-ce9e-11ef-9430-2cf05db24bc7','Web Developer','Build and maintain websites. Collaborate with designers and back-end developers.','Dưới 10 triệu','Dallas, TX','5 năm','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript','Bán thời gian','Remote','Pending','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-02-28 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,5,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a3abb-ce9e-11ef-9430-2cf05db24bc7','Mobile Developer','Develop mobile applications for iOS and Android platforms. Ensure app performance and reliability.','Dưới 10 triệu','San Jose, CA','2 năm','Health Insurance, Paid Time Off','Experience with Swift, Kotlin, React Native','Bán thời gian','Hybrid','Pending','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25f02b-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,1,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d5ed3-ce9e-11ef-9430-2cf05db24bc7','Backend Developer','Develop server-side applications and APIs, optimize databases and ensure system scalability.','10 - 15 triệu','Chicago, IL','3 năm','Health Insurance, 401k','Proficient in Node.js, Express, MongoDB','Bán thời gian','On-site','Closed','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6786-ce9e-11ef-9430-2cf05db24bc7','AI Engineer','Design and implement artificial intelligence algorithms and models to improve automation and decision-making processes.','20 - 25 triệu','San Francisco, CA','1 năm','Health Insurance, Paid Time Off','Proficient in Python, TensorFlow, deep learning','Bán thời gian ','Remote','Pending','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e912-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6b01-ce9e-11ef-9430-2cf05db24bc7','Content Marketing Manager','Plan and execute content marketing strategies to enhance the company’s digital presence and engagement.','15 - 20 triệu','Los Angeles, CA','4 năm','Health Insurance, Bonuses','Experience in content creation, SEO, and analytics','Thực tập','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6df4-ce9e-11ef-9430-2cf05db24bc7','Graphic Designer','Create visual designs for marketing materials, digital ads, and website content to engage customers.','25 - 30 triệu','Miami, FL','5 năm','Health Insurance, Paid Time Off','Proficient in Adobe Creative Suite, Illustrator, Photoshop','Khác','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ec4e-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d72a4-ce9e-11ef-9430-2cf05db24bc7','Sales Manager','Manage a sales team, develop strategies, and oversee sales targets and performance in the company.','30 - 50 triệu','Boston, MA','2 năm','Health Insurance, Bonuses','Experience in sales team management, CRM tools, negotiation','Khác','On-site','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ed2a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7753-ce9e-11ef-9430-2cf05db24bc7','Frontend Developer','Develop and maintain the client-side of web applications, collaborate with designers for UI/UX implementation.','Trên 50 triệu','New York, NY','5 năm','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript, React','Khác','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7ada-ce9e-11ef-9430-2cf05db24bc7','HR Manager','Oversee HR operations, recruitment, employee relations, and ensure a positive company culture.','Thỏa thuận','Dallas, TX','5 năm','Health Insurance, Paid Leave','Strong knowledge of labor laws, HR software','Khác','On-site','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ee06-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7e4c-ce9e-11ef-9430-2cf05db24bc7','Customer Support Specialist','Assist customers with inquiries, troubleshoot issues, and provide solutions via chat, email, or phone.','Dưới 10 triệu','Seattle, WA','2 năm','Health Insurance, Paid Time Off','Strong communication skills, experience with CRM systems','Khác','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25eec3-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d82a5-ce9e-11ef-9430-2cf05db24bc7','Mobile App Developer','Develop cross-platform mobile applications, focus on Android and iOS platforms for optimized performance.','Thỏa thuận','San Jose, CA','3 năm','Health Insurance, 401k','Experience with React Native, Swift, Kotlin','Khác','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25f02b-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d87c0-ce9e-11ef-9430-2cf05db24bc7','Cloud Engineer','Design, implement, and manage cloud infrastructure to ensure optimal cloud computing services.','Dưới 10 triệu','Houston, TX','1 năm','Health Insurance, Paid Leave','Experience with AWS, Azure, and cloud security practices','Khác','On-site','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d8b76-ce9e-11ef-9430-2cf05db24bc7','Full Stack Developer','Develop both front-end and back-end components for dynamic web applications. Optimize user experience and functionality.','Dưới 10 triệu','Atlanta, GA','1 năm','Health Insurance, Bonuses','Proficient in JavaScript, Node.js, React, and SQL databases','Khác','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d8edd-ce9e-11ef-9430-2cf05db24bc7','SEO Specialist','Optimize website content for search engines, improve ranking, and increase traffic.','Thỏa thuận','12, Hồ Chí Minh','2 năm','Health Insurance, 401k','Proficient in SEO tools like Google Analytics, SEMrush','Thực tập','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9225-ce9e-11ef-9430-2cf05db24bc7','Product Manager','Lead the product development cycle from concept to delivery, coordinate with cross-functional teams.','Dưới 10 triệu','Boston, MA','2 năm','Health Insurance, Paid Time Off','Experience in Agile methodologies, product management tools','Thực tập','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ea73-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d963a-ce9e-11ef-9430-2cf05db24bc7','Digital Marketing Specialist','Develop and implement digital marketing campaigns across various online platforms to increase brand awareness.','Dưới 10 triệu','New York, NY','4 năm','Health Insurance, Paid Time Off','Experience with Google Ads, Facebook Ads, and email marketing','Thực tập','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9b1d-ce9e-11ef-9430-2cf05db24bc7','Frontend UI Developer','Design and implement the user interface for web applications, focus on delivering high-quality user experience.','Thỏa thuận','Austin, TX','2 năm','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript, React','Thực tập','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9e91-ce9e-11ef-9430-2cf05db24bc','Frontend','Maintain and optimize network infrastructure, troubleshoot network issues, and ensure secure connectivity.','Dưới 10 triệu','Los Angeles, CA','1 năm','Health Insurance, 401k','Experience with routers, firewalls, and VPNs','Thực tập','On-site','Pending','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25fb0c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9e91-ce9e-11ef-9430-2cf05db24bc7','Network Engineer âdd','Maintain and optimize network infrastructure, troubleshoot network issues, and ensure secure connectivity.','25 - 30 triệu','12, Hồ Chí Minh','3 năm','Health Insurance, 401k','Experience with routers, firewalls, and VPNs','Thực tập','On-site','Active','7','1f25fb0c-ce9e-11ef-9430-2cf05db24bc7','2025-04-18 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9e91-ce9e-11ef-9430-2cf05db24bcd','Network Enginee','Maintain and optimize network infrastructure, troubleshoot network issues, and ensure secure connectivity.','Dưới 10 triệu','Miami, FL','2 năm','Health Insurance, 401k','Experience with routers, firewalls, and VPNs','Toàn thời gian','On-site','Active','7','1f25fb0c-ce9e-11ef-9430-2cf05db24bc7','2025-01-23 00:00:00.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','Security Analystsd','Monitor and protect network systems from cyber threats, perform vulnerability assessments, and enforce security policies.','Trên 50 triệu','Miami, FL','1 năm','Health Insurance, Paid Leave','Health Insurance, Paid Leave','Thực tập','Remote','Pending','7','1f25f0db-ce9e-11ef-9430-2cf05db24bc7','2025-04-09 22:26:39.000000',NULL,'2025-02-23 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('job-hthdls0yr','TITLE','gdfgd','tren-50-trieu','dfgdfg','1-nam','dfgdfg','dfgdfgdf','ban-thoi-gian',NULL,'Active','7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-04-18 00:00:00.000000',NULL,'2025-04-15 09:19:50','minhha2k5','2025-04-15 09:19:50.000000','minhha2k5',1,1,'Quản lý / Giám sát','Đại Học trở lên');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'ID người nhận thông báo',
  `sender_id` int DEFAULT NULL COMMENT 'ID người gửi thông báo (nếu có)',
  `type` enum('account_verification','job_application','application_response','application_cancelled','job_closed','cv_reviewed','payment_success','payment_failed','subscription_expiring','subscription_expired','company_review','system') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại thông báo',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề thông báo',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung thông báo',
  `data` json DEFAULT NULL COMMENT 'Dữ liệu bổ sung (job_id, application_id, etc.)',
  `is_read` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Trạng thái đã đọc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  KEY `notifications_sender_id_foreign` (`sender_id`),
  CONSTRAINT `notifications_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=996942869 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (440446973,5,NULL,'system','Tài khoản đang chờ duyệt','Tài khoản của bạn đang trong trạng thái chờ duyệt. Vui lòng chờ quản trị viên xử lý.','{\"action\": \"candidate_status_change\", \"status\": \"Pending\"}',0,'2025-04-27 07:59:33','2025-04-27 07:59:33'),(996942854,21,NULL,'system','Hồ sơ công ty đang được xét duyệt','Hồ sơ công ty của bạn đang được quản trị viên xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',NULL,0,'2025-04-27 07:33:54','2025-04-27 07:33:54'),(996942855,21,NULL,'system','Hồ sơ công ty đang được xét duyệt','Hồ sơ công ty của bạn đang được quản trị viên xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',NULL,0,'2025-04-27 07:33:54','2025-04-27 07:33:54'),(996942861,22,NULL,'system','Hồ sơ công ty không được phê duyệt','Rất tiếc, hồ sơ công ty của bạn chưa đáp ứng đủ yêu cầu. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',NULL,0,'2025-04-27 07:43:49','2025-04-27 07:43:49'),(996942866,4,NULL,'system','Hồ sơ công ty đã được phê duyệt','Chúc mừng! Hồ sơ công ty của bạn đã được phê duyệt. Bạn có thể bắt đầu sử dụng đầy đủ các tính năng của hệ thống.',NULL,0,'2025-04-27 07:58:20','2025-04-27 07:58:20'),(996942867,4,NULL,'system','Hồ sơ công ty đang được xét duyệt','Hồ sơ công ty của bạn đang được quản trị viên xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',NULL,0,'2025-04-27 07:58:48','2025-04-27 07:58:48'),(996942868,4,NULL,'system','Hồ sơ công ty đã được phê duyệt','Chúc mừng! Hồ sơ công ty của bạn đã được phê duyệt. Bạn có thể bắt đầu sử dụng đầy đủ các tính năng của hệ thống.',NULL,0,'2025-04-27 07:59:50','2025-04-27 07:59:50');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `amount` bigint NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `bank_code` varchar(255) DEFAULT NULL,
  `transaction_type` varchar(255) NOT NULL DEFAULT 'PAYMENT',
  `transaction_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
INSERT INTO `payment_transactions` VALUES ('02115940',5,120000,'pending',NULL,'PAYMENT','2024-12-02 04:59:40'),('02141917',5,120000,'pending',NULL,'PAYMENT','2024-12-02 07:19:17'),('02155558',5,120000,'pending',NULL,'PAYMENT','2024-12-02 08:55:58'),('02171251',5,120000,'success',NULL,'PAYMENT','2024-12-02 10:12:51'),('03081420',5,120000,'success',NULL,'PAYMENT','2024-12-03 01:14:20'),('03081634',5,120000,'success',NULL,'PAYMENT','2024-12-03 01:16:34'),('05143801',5,120000,'pending',NULL,'PAYMENT','2024-12-05 07:38:01'),('10085419',5,120000,'pending',NULL,'PAYMENT','2024-12-10 01:54:19'),('13112503',5,1200000,'pending',NULL,'PAYMENT','2024-12-13 04:25:03'),('13161805',5,1200000,'pending',NULL,'PAYMENT','2024-12-13 09:18:05'),('29115239',5,120000,'pending',NULL,'PAYMENT','2024-11-29 04:52:39'),('29115410',5,120000,'pending',NULL,'PAYMENT','2024-11-29 04:54:10'),('29115422',5,120000,'pending',NULL,'PAYMENT','2024-11-29 04:54:22');
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruiter_companies`
--

DROP TABLE IF EXISTS `recruiter_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiter_companies` (
  `recruiter_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `company_id` varchar(36) NOT NULL,
  `status` enum('pending','active','rejected') DEFAULT 'pending',
  PRIMARY KEY (`recruiter_id`),
  KEY `user_id` (`user_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `recruiter_companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recruiter_companies_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruiter_companies`
--

LOCK TABLES `recruiter_companies` WRITE;
/*!40000 ALTER TABLE `recruiter_companies` DISABLE KEYS */;
INSERT INTO `recruiter_companies` VALUES ('1',21,'1','pending'),('2',22,'2','rejected'),('4',23,'3','rejected'),('5',24,'4','rejected'),('6',25,'5','pending'),('7',26,'6','rejected'),('8',4,'7','active');
/*!40000 ALTER TABLE `recruiter_companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` varchar(36) NOT NULL,
  `company_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `rating` tinyint DEFAULT NULL,
  `comment` text,
  `review_date` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  PRIMARY KEY (`review_id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('rev-001','7',5,5,'Môi trường làm việc chuyên nghiệp, đồng nghiệp thân thiện. Công ty có nhiều cơ hội thăng tiến và chế độ phúc lợi tốt.','2024-01-15 09:30:00','user5','2024-01-15 09:30:00.000000','user5',1),('rev-002','7',2,4,'Lương thưởng hấp dẫn, được đào tạo thường xuyên. Tuy nhiên cần cải thiện thêm về cơ sở vật chất.','2024-01-16 14:20:00','user2','2024-01-16 14:20:00.000000','user2',1),('rev-003','7',3,3,'Công việc ổn định nhưng áp lực cao. Cần cải thiện về work-life balance.','2024-01-17 11:45:00','user3','2024-01-17 11:45:00.000000','user3',1),('rev-004','7',4,3,'Đồng nghiệp nhiệt tình hỗ trợ. Tuy nhiên quy trình làm việc còn nhiều điểm cần cải thiện.','2024-01-18 16:15:00','user4','2024-01-18 16:15:00.000000','user4',1),('rev-005','7',6,2,'Quản lý chưa thực sự lắng nghe nhân viên. Lương thưởng chưa tương xứng với công sức.','2024-01-19 10:00:00','user6','2024-01-19 10:00:00.000000','user6',1),('rev-006','7',7,4,'Ưu điểm:\n- Môi trường năng động\n- Cơ hội học hỏi nhiều\n- Đồng nghiệp thân thiện\n\nNhược điểm:\n- Đôi khi OT nhiều\n- Quy trình còn rườm rà','2024-01-20 13:30:00','user7','2024-01-20 13:30:00.000000','user7',1),('rev-007','7',8,5,'Rất hài lòng với môi trường làm việc. Sếp tốt, đồng nghiệp nhiệt tình.','2024-01-21 15:45:00','user8','2024-01-21 15:45:00.000000','user8',1),('rev-008','7',9,4,'Công ty có chính sách phúc lợi tốt, thường xuyên tổ chức các hoạt động team building.','2024-01-22 09:15:00','user9','2024-01-22 09:15:00.000000','user9',1),('rev-009','10',10,5,'Công ty có lộ trình thăng tiến rõ ràng. Được đào tạo kỹ năng thường xuyên.','2024-01-23 11:20:00','user10','2024-01-23 11:20:00.000000','user10',1),('rev-010','10',11,3,'Công việc ổn định nhưng cơ hội thăng tiến còn hạn chế.','2024-01-24 14:40:00','user11','2024-01-24 14:40:00.000000','user11',1),('rev-8oqnz3y1r','10',10,5,'Công ty tốt','2025-04-15 07:06:04','5',NULL,NULL,1),('rev-al3h9oqkv','7',5,5,'Ưu điểm chiều nhân viên 5 triệu','2025-03-11 08:21:41','5',NULL,NULL,1),('rev-bgsmclkfn','7',5,4,'quá tốt','2025-03-11 08:07:24','5',NULL,NULL,1),('rev-jzpsc3eny','7',5,3,'hôm nsog ','2025-03-11 08:17:15','5',NULL,NULL,1),('rev-pb936xzzx','10',10,5,'Công ty tốt','2025-03-11 07:46:02','5',NULL,NULL,1),('rev-wo5fivzju','10',10,5,'Công ty tốt','2025-04-15 07:03:32','5',NULL,NULL,1),('rev-zubdze5du','1',5,5,'đá','2025-04-25 07:55:41','5',NULL,NULL,1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `saved_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `saved_date` datetime DEFAULT NULL,
  PRIMARY KEY (`saved_id`),
  KEY `user_id` (`user_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
INSERT INTO `saved_jobs` VALUES ('saved-1740905448555',7,'1f2d9e91-ce9e-11ef-9430-2cf05db24bcd','2025-03-02 08:50:48'),('saved-1744708538950',33,'1f2a2488-ce9e-11ef-9430-2cf05db24bc7','2025-04-15 09:15:38'),('saved-1744709755610',33,'1f29e210-ce9e-11ef-9430-2cf05db24bc7','2025-04-15 09:35:55'),('saved-1745741941512',3,'1f2a1511-ce9e-11ef-9430-2cf05db24bc7','2025-04-27 08:19:01');
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `skill_id` varchar(36) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `version` int DEFAULT '1',
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `skill_name` (`skill_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES ('1f366a6b-ce9e-11ef-9430-2cf05db24bc7','JavaScript','A high-level, versatile programming language used for web development.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f36858f-ce9e-11ef-9430-2cf05db24bc7','Node.js','A JavaScript runtime environment that allows running JavaScript on the server-side.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f368875-ce9e-11ef-9430-2cf05db24bc7','React','A JavaScript library for building user interfaces, primarily for single-page applications.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f3689ba-ce9e-11ef-9430-2cf05db24bc7','Python','A high-level programming language used for general-purpose programming and machine learning.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f368ac7-ce9e-11ef-9430-2cf05db24bc7','SQL','Structured Query Language, used to manage and query relational databases.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f368be2-ce9e-11ef-9430-2cf05db24bc7','Java','A widely-used object-oriented programming language for building mobile and web applications.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f368cf1-ce9e-11ef-9430-2cf05db24bc7','C#','A modern, object-oriented programming language used for building Windows applications and web services.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1),('1f368e1a-ce9e-11ef-9430-2cf05db24bc7','PHP','A server-side scripting language commonly used for web development and creating dynamic web pages.','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1);
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `base_url` text COLLATE utf8mb4_general_ci NOT NULL,
  `api_key` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES ('anthropic','Anthropic','https://api.anthropic.com/v1','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'),('anthropictest','Anthropictest','https://api.anthropic.com/v1','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'),('deepseek','DeepSeek','https://api.deepseek.com','sk-3addc20e5db94917914ce9d9a81eac12'),('googleai','Google AI','https://generativelanguage.googleapis.com/v1beta/openai/','AIzaSyAaA-vzR9v8B41NvvZ914GlfcamClNSiis'),('openai','Open AI','https://api.openai.com/v1','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');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_fields`
--

DROP TABLE IF EXISTS `template_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_fields` (
  `field_id` varchar(36) NOT NULL,
  `template_id` varchar(36) NOT NULL,
  `field_name` varchar(255) NOT NULL,
  `field_type` enum('text','textarea','date','image','rich_text') NOT NULL,
  `field_label` varchar(255) NOT NULL,
  `field_placeholder` text,
  `field_order` int DEFAULT NULL,
  `section_name` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`field_id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `template_fields_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `cv_templates` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_fields`
--

LOCK TABLES `template_fields` WRITE;
/*!40000 ALTER TABLE `template_fields` DISABLE KEYS */;
INSERT INTO `template_fields` VALUES ('tf-010-01','template-basic-010','fullName','text','Họ và tên','Quản Nguyễn Anh',1,NULL,1),('tf-010-02','template-basic-010','jobTitle','text','Vị trí ứng tuyển','Chuyên viên đào tạo nội bộ',2,NULL,1),('tf-010-03','template-basic-010','jobDescription','textarea','Mô tả công việc','02 năm kinh nghiệm đào tạo kỹ năng bán hàng và kỹ năng mềm tại trường đại học và doanh nghiệp...',3,NULL,1),('tf-010-04','template-basic-010','phone','text','Số điện thoại','(024) 6680 5588',4,NULL,1),('tf-010-05','template-basic-010','email','text','Email','hotro@topcv.vn',5,NULL,1),('tf-010-06','template-basic-010','website','text','Website','fb.com/topcv.vn',6,NULL,0),('tf-010-07','template-basic-010','address','text','Địa chỉ','Quận A, Hà Nội',7,NULL,0),('tf-010-08','template-basic-010','expStartDate','text','Thời gian bắt đầu','08/2020',8,NULL,1),('tf-010-09','template-basic-010','expEndDate','text','Thời gian kết thúc','08/2022',9,NULL,1),('tf-010-10','template-basic-010','expPosition','text','Vị trí công việc','Chuyên Viên Đào Tạo Nội Bộ',10,NULL,1),('tf-010-11','template-basic-010','expCompany','text','Tên công ty','Công ty ABC',11,NULL,1),('tf-010-12','template-basic-010','expDescriptionItems','textarea','Mô tả công việc','• Biên soạn và cập nhật tài liệu đào tạo theo kế hoạch\n• Phân tích nhu cầu và lập kế hoạch đào tạo cho 500 nhân viên',12,NULL,1),('tf-010-13','template-basic-010','expStartDate2','text','Thời gian bắt đầu','08/2018',13,NULL,0),('tf-010-14','template-basic-010','expEndDate2','text','Thời gian kết thúc','07/2020',14,NULL,0),('tf-010-15','template-basic-010','expPosition2','text','Vị trí công việc','Chuyên Viên Đào Tạo',15,NULL,0),('tf-010-16','template-basic-010','expCompany2','text','Tên công ty','Công ty XYZ',16,NULL,0),('tf-010-17','template-basic-010','expDescriptionItems2','textarea','Mô tả công việc','• Quản lý chương trình phát triển kỹ năng cho 300 nhân viên\n• Phân tích nhu cầu, lập kế hoạch, ngân sách',17,NULL,0),('tf-010-18','template-basic-010','schoolName','text','Tên trường học','Tên trường học',18,NULL,1),('tf-010-19','template-basic-010','major','text','Ngành học','Ngành học / Môn học',19,NULL,1),('tf-010-20','template-basic-010','eduStartDate','text','Thời gian bắt đầu','08/2018',20,NULL,1),('tf-010-21','template-basic-010','eduEndDate','text','Thời gian kết thúc','07/2020',21,NULL,1),('tf-010-22','template-basic-010','educationDescription','textarea','Mô tả','Mô tả quá trình học tập hoặc thành tích của bạn',22,NULL,0),('tf-010-23','template-basic-010','skillItems','textarea','Các kỹ năng','Kỹ năng 1\nKỹ năng 2\nKỹ năng 3',23,NULL,1),('tf-010-24','template-basic-010','certificateDate','text','Thời gian','Thời gian',24,NULL,0),('tf-010-25','template-basic-010','certificateName','text','Tên chứng chỉ','Tên chứng chỉ',25,NULL,0),('tf-010-26','template-basic-010','certificateDate2','text','Thời gian','Thời gian',26,NULL,0),('tf-010-27','template-basic-010','certificateName2','text','Tên chứng chỉ','Tên chứng chỉ',27,NULL,0);
/*!40000 ALTER TABLE `template_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_type_variants`
--

DROP TABLE IF EXISTS `template_type_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_type_variants` (
  `variant_id` varchar(36) NOT NULL,
  `template_id` varchar(36) DEFAULT NULL,
  `type_id` varchar(36) DEFAULT NULL,
  `variant_thumbnail` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`variant_id`),
  KEY `template_id` (`template_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `template_type_variants_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `cv_templates` (`template_id`),
  CONSTRAINT `template_type_variants_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `template_types` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_type_variants`
--

LOCK TABLES `template_type_variants` WRITE;
/*!40000 ALTER TABLE `template_type_variants` DISABLE KEYS */;
INSERT INTO `template_type_variants` VALUES ('vrid','template-basic-010','type-modern','ss',0),('vrid1','template-basic-010','type-modern','ss',0),('vrid2','template-basic-010','type-professional','ss',0);
/*!40000 ALTER TABLE `template_type_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_types`
--

DROP TABLE IF EXISTS `template_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_types` (
  `type_id` varchar(36) NOT NULL,
  `type_name` varchar(255) NOT NULL,
  `type_description` text,
  `display_order` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_types`
--

LOCK TABLES `template_types` WRITE;
/*!40000 ALTER TABLE `template_types` DISABLE KEYS */;
INSERT INTO `template_types` VALUES ('type-creative','Sáng tạo','Thiết kế độc đáo, phù hợp ngành sáng tạo',3,1),('type-modern','Hiện đại','Thiết kế hiện đại, trẻ trung',4,1),('type-professional','Chuyên nghiệp','Thiết kế chuyên nghiệp, phù hợp mọi ngành nghề',1,1),('type-simple','Đơn giản','Thiết kế tối giản, dễ đọc',2,1);
/*!40000 ALTER TABLE `template_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_usages`
--

DROP TABLE IF EXISTS `token_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_usages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `conversation_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `token_count` int NOT NULL,
  `bot_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `output_count` bigint NOT NULL,
  `input_count` bigint NOT NULL,
  `usage_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `bot_id` (`bot_id`),
  CONSTRAINT `token_usages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `token_usages_ibfk_2` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `token_usages_ibfk_3` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=275 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_usages`
--

LOCK TABLES `token_usages` WRITE;
/*!40000 ALTER TABLE `token_usages` DISABLE KEYS */;
/*!40000 ALTER TABLE `token_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_cvs`
--

DROP TABLE IF EXISTS `user_cvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cvs` (
  `cv_id` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `template_id` varchar(36) NOT NULL,
  `cv_name` varchar(255) NOT NULL,
  `cv_content` json DEFAULT NULL,
  `cv_html` text,
  `status` enum('draft','published') DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_template` tinyint DEFAULT '0',
  PRIMARY KEY (`cv_id`),
  KEY `user_id` (`user_id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `user_cvs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_cvs_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `cv_templates` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_cvs`
--

LOCK TABLES `user_cvs` WRITE;
/*!40000 ALTER TABLE `user_cvs` DISABLE KEYS */;
INSERT INTO `user_cvs` VALUES ('cv-user-001',5,'template-basic-01','CV xin việc Frontend','{\"skills\": \"HTML, CSS, JavaScript...\", \"personal\": {\"email\": \"nguyenvana@email.com\", \"phone\": \"0123456789\", \"title\": \"Frontend Developer\", \"address\": \"Hà Nội\", \"fullname\": \"Nguyễn Văn A\"}, \"education\": \"Đại học ABC...\", \"experience\": \"Công ty XYZ...\"}','<div class=\"cv-container\">...</div>','published','2025-01-14 13:37:09','2025-01-14 13:37:09',1),('cv-user-002',5,'template-creative-01','CV xin việc Frontend','{\"skills\": \"HTML, CSS, JavaScript...\", \"personal\": {\"email\": \"nguyenvana@email.com\", \"phone\": \"0123456789\", \"title\": \"Frontend Developer\", \"address\": \"Hà Nội\", \"fullname\": \"Nguyễn Văn A\"}, \"education\": \"Đại học ABC...\", \"experience\": \"Công ty XYZ...\"}','<div class=\"cv-container\">...</div>','published','2025-01-14 13:37:09','2025-01-14 13:37:09',1),('cv-user-003',5,'template-basic-010','My Professional CV','{\"title\": \"Software Engineer\", \"fullName\": \"John Doe\"}','<div class=\"cv-container\">...</div>','published','2024-01-15 10:00:00','2024-01-15 10:00:00',1);
/*!40000 ALTER TABLE `user_cvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `token_device` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `number_devices` int DEFAULT '1',
  `plan` enum('Basic','Pro','ProMax') DEFAULT 'Basic',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'0398397591','Huynh Minh Ha','user','thaopro','hadep12a@gmail.com',1,0,NULL,'$2a$08$SCw/htG.Ab49l.tKgI84dOHRY3SWM/Rq4Eu90evtflscv9Hg0IO3e','2024-11-20 04:35:32','2024-11-20 04:35:32',1,'Pro'),(2,'0335190587','Huynh Minh Ha','admin','minhha2k3','hahuynh.ou@gmail.com',1,0,NULL,'$2a$08$MkAcMxfnlp2/zQwkESMTrOSa2yXw4MW0lIS0btoRjJZt4.MZeLrom','2024-11-20 07:39:25','2024-11-20 07:39:25',1,'Basic'),(3,'0398397590','Huỳnh Minh Hà','user','minhha2k4','hadep8a@gmail.com',1,0,NULL,'$2a$08$7a56GxvZTtVNWb.Rw6Gx4e2EMd6NmPQm1zihU590gL6KMr6OvmHbm','2024-11-22 07:28:29','2024-11-22 07:28:29',1,'Basic'),(4,'0398397592','Huỳnh Minh Hà','recruiter','minhha2k5','hadep2a@gmail.com',1,0,NULL,'$2a$08$ba7CauJvQFXzvck/..gJaeaLQRvvwWAVm9avvHiydmKmZxI0tKw2S','2024-11-22 07:33:10','2024-11-22 07:33:10',1,'ProMax'),(5,'0398397599','NguyenMoid','admin','ngducvi','hadep20a@gmail.com',1,0,NULL,'$2a$08$S4ke4IVYv0zsD0Zs1aeePO8HJijsnHrIMjUbNI1FjXdNgOBJRi6mS','2024-11-23 01:27:13','2024-12-17 03:46:21',1,'Basic'),(6,'0398397598','Huỳnh Minh Hà','user','minhha2k11','hadep9a@gmail.com',1,0,NULL,'$2a$08$t0Jn3ke7mlIRiw05/iRCjuUy0UdYgqjktYSwPPv8c5P9CCTctC8G6','2024-11-23 01:56:28','2024-11-23 01:56:28',1,'Basic'),(7,'0398397596','HNguyenx Phúc c','user','minhha2k100','hadep7a@gmail.com',1,0,NULL,'$2a$08$yInAOTb5muZMK/nGnuipJOJotunO531n4gniGCyGCB5BkuDYVqVem','2024-11-29 03:32:18','2024-11-29 03:32:18',1,'Basic'),(8,'0399730616','Dep trai','user','ducvi','ngducvicrc@gmail.com',1,0,NULL,'$2a$08$p44yvL44EiqObTmhY1hqZ.oDfxcP2Yqor6VdrNU5EcQlhHeTM39.6','2024-12-17 10:13:49','2024-12-17 10:13:49',1,'Basic'),(9,'0384754154','ngducvi','user','Ngducvi','ngducviccgc@gmail.com',1,0,NULL,'$2a$08$3VQbBwEojPUEefKU2FfGleZwhRwN26WjU41fgU1.V8DL68WOpXTD2','2024-12-24 08:33:55','2024-12-24 08:33:55',1,'Basic'),(10,'0123456789','Admin User','admin','admin_user','admin@example.com',1,1,NULL,'adminpassword','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(11,'0123456790','Recruiter One','recruiter','recruiter1','recruiter1@example.com',1,1,NULL,'recruiterpassword1','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(12,'0123456791','Recruiter Two','recruiter','recruiter2','recruiter2@example.com',1,1,NULL,'recruiterpassword2','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(13,'0123456792','Applicant Onesss','user','applicant1','applicant1@example.com',1,1,NULL,'password1','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(14,'0123456793','Applicant Two','user','applicant2','applicant2@example.com',1,1,NULL,'password2','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(15,'0123456794','Applicant Three','user','applicant3','applicant3@example.com',1,1,NULL,'password3','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(16,'0123456795','Applicant Four','user','applicant4','applicant4@example.com',1,1,NULL,'password4','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(17,'0123456796','Applicant Five','user','applicant5','applicant5@example.com',1,1,NULL,'password5','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(18,'0123456797','Applicant Six','user','applicant6','applicant6@example.com',1,1,NULL,'password6','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(19,'0123456798','Applicant Seven','user','applicant7','applicant7@example.com',1,1,NULL,'password7','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(20,'0123456799','Applicant Eight','user','applicant8','applicant8@example.com',1,1,NULL,'password8','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(21,'0123456800','Applicant Nine','recruiter','applicant9','applicant9@example.com',1,1,NULL,'password9','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(22,'0123456801','Applicant Ten','recruiter','applicant10','applicant10@example.com',1,1,NULL,'password10','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(23,'0123456802','Applicant Eleven','recruiter','applicant11','applicant11@example.com',1,1,NULL,'password11','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(24,'0123456803','Applicant Twelve','recruiter','applicant12','applicant12@example.com',1,1,NULL,'password12','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(25,'0123456804','Applicant Thirteen','recruiter','applicant13','applicant13@example.com',1,1,NULL,'password13','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(26,'0123456805','Applicant Fourteen','recruiter','applicant14','applicant14@example.com',1,1,NULL,'password14','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(27,'0123456806','Applicant Fifteen','user','applicant15','applicant15@example.com',1,1,NULL,'password15','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(28,'0123456807','Applicant Sixteen','user','applicant16','applicant16@example.com',1,1,NULL,'password16','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(29,'0123456808','Applicant Seventeen','user','applicant17','applicant17@example.com',1,1,NULL,'password17','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(30,'0123456809','Applicant Eighteen','user','applicant18','applicant18@example.com',1,1,NULL,'password18','2025-01-09 22:26:39','2025-01-09 22:26:39',1,'Basic'),(32,'0399730776','ngducvitest','user','ngduvvigg','ngducvigg@gmail.com',1,0,NULL,'$2a$08$DTK1wfDUnFiN9V8BXrwYYuvJ3.Ir065DAz7DamGlD1ufBQTaR5aZC','2025-03-14 15:40:50','2025-03-14 15:40:50',1,'Basic'),(33,'0399485151','ngdufsfsf','user','ngducvicc','ngducvicc@gmail.com',1,0,NULL,'$2a$08$fW3qxQBmqzLnB8e1O3kDcuu5CkbqC3DZ0NawLrXhuEQxMcwa3G9PG','2025-04-15 08:46:30','2025-04-15 08:46:30',1,'Basic');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewed_jobs`
--

DROP TABLE IF EXISTS `viewed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewed_jobs` (
  `viewed_id` varchar(36) NOT NULL,
  `user_id` int DEFAULT NULL,
  `job_id` varchar(36) DEFAULT NULL,
  `viewed_date` datetime DEFAULT NULL,
  PRIMARY KEY (`viewed_id`),
  KEY `user_id` (`user_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `viewed_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `viewed_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewed_jobs`
--

LOCK TABLES `viewed_jobs` WRITE;
/*!40000 ALTER TABLE `viewed_jobs` DISABLE KEYS */;
INSERT INTO `viewed_jobs` VALUES ('5',6,'1f2a2488-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00'),('viewed-1740766899647',4,'1f2a3006-ce9e-11ef-9430-2cf05db24bc7','2025-02-28 18:21:39'),('viewed-1740905438831',7,'1f2d9e91-ce9e-11ef-9430-2cf05db24bcd','2025-03-02 08:50:38'),('viewed-1741951907468',3,'1f2a1511-ce9e-11ef-9430-2cf05db24bc7','2025-03-14 11:31:47'),('viewed-1744708582330',33,'1f2a2488-ce9e-11ef-9430-2cf05db24bc7','2025-04-15 09:16:27'),('viewed-1745741015314',5,'1f2a36f4-ce9e-11ef-9430-2cf05db24bc7','2025-04-27 08:03:35'),('viewed-1745741646246',3,'1f2d9e91-ce9e-11ef-9430-2cf05db24bc7','2025-04-27 08:14:06');
/*!40000 ALTER TABLE `viewed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `balance` bigint DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (2,32,5000,'2025-03-14 15:41:08','2025-03-19 15:41:08'),(3,33,5000,'2025-04-15 08:46:57','2025-04-20 08:46:57');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-28 16:15:58
