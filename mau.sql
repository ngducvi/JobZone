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
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `default_input_rate` float NOT NULL,
  `default_output_rate` float NOT NULL,
  `input_rate` float DEFAULT NULL,
  `output_rate` float DEFAULT NULL,
  `space_id` varchar(255) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bots`
--

LOCK TABLES `bots` WRITE;
/*!40000 ALTER TABLE `bots` DISABLE KEYS */;
/*!40000 ALTER TABLE `bots` ENABLE KEYS */;
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
INSERT INTO `candidate_cvs` VALUES ('001',5,'Test_cv','cv.link','2025-01-14 13:36:32','2025-01-14 13:36:32',1);
/*!40000 ALTER TABLE `candidate_cvs` ENABLE KEYS */;
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
INSERT INTO `candidates` VALUES ('1',5,'profile1.jpg','cv1.pdf','JavaScript, Node.js','2 years in front-end development','Bachelor in Computer Science'),('10',19,'profile10.jpg','cv10.pdf','Node.js, Express','5 years in back-end development','Bachelor in Software Engineering'),('11',20,'profile11.jpg','cv11.pdf','Angular, TypeScript','4 years in front-end development','Bachelor in Web Development'),('12',21,'profile12.jpg','cv12.pdf','SQL, MySQL','2 years in database management','Bachelor in Computer Science'),('13',22,'profile13.jpg','cv13.pdf','C#, .NET','3 years in software development','Master in Software Engineering'),('14',23,'profile14.jpg','cv14.pdf','Java, Android','3 years in mobile app development','Bachelor in Computer Science'),('15',24,'profile15.jpg','cv15.pdf','Python, Flask','1 year in back-end development','Bachelor in Information Systems'),('16',25,'profile16.jpg','cv16.pdf','HTML, CSS','2 years in web development','Master in Web Engineering'),('17',26,'profile17.jpg','cv17.pdf','Go, Docker','3 years in system development','Bachelor in Computer Engineering'),('18',27,'profile18.jpg','cv18.pdf','Swift, iOS','4 years in mobile app development','Bachelor in Software Engineering'),('2',11,'profile2.jpg','cv2.pdf','Python, Django','3 years in back-end development','Bachelor in Information Technology'),('3',12,'profile3.jpg','cv3.pdf','React, CSS','1 year in full-stack development','Bachelor in Software Engineering'),('4',13,'profile4.jpg','cv4.pdf','PHP, Laravel','4 years in back-end development','Master in Computer Science'),('5',14,'profile5.jpg','cv5.pdf','Java, Spring','2 years in back-end development','Bachelor in Computer Science'),('6',15,'profile6.jpg','cv6.pdf','C++, JavaScript','3 years in software development','Bachelor in Computer Engineering'),('7',16,'profile7.jpg','cv7.pdf','HTML, CSS, JavaScript','1 year in front-end development','Bachelor in Web Development'),('8',17,'profile8.jpg','cv8.pdf','Ruby, Rails','2 years in web development','Bachelor in Information Technology'),('9',18,'profile9.jpg','cv9.pdf','JavaScript, React','3 years in front-end development','Master in Web Engineering');
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
INSERT INTO `career_handbook` VALUES ('1','How to Choose the Right Career Path','1','<p>L&agrave; con g&aacute;i một gia đ&igrave;nh gi&agrave;u c&oacute; ở Anh, Florence Nightingale (1820-1910) lu&ocirc;n được cha mẹ kỳ vọng l&agrave; sẽ trở th&agrave;nh một người c&oacute; vai vế. Tuy nhi&ecirc;n, c&ocirc; lại c&oacute; những dự t&iacute;nh ri&ecirc;ng. Từ tuổi 16, Florence nhận ra m&igrave;nh đ&atilde; được Ch&uacute;a ban cho một sức mạnh nội t&acirc;m huyền b&iacute; để chăm s&oacute;c người kh&aacute;c.</p>','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('10','Adapting to Changes in the Job Market','6','How to stay relevant in an evolving labor market.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,0),('11','How to Choose the Right Career Path','1','Tips and advice on selecting a suitable career path.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('12','Job Search Strategies That Work','2','Proven strategies to enhance your job search efforts.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('13','Understanding Compensation Packages','3','Details on evaluating salary, benefits, and bonuses.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('14','Industry-Specific Knowledge: IT Sector','4','A deep dive into IT industry trends and skills.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('15','Preparing for Your First Job','5','Essential tips for entering the workforce.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('16','Top Recruitment Trends in 2025','6','Analysis of current recruitment trends and predictions.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('17','How to Build Your Personal Brand','1','The importance of personal branding in career success.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('18','Networking Tips for Job Seekers','2','How to effectively network for career opportunities.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('19','Navigating Remote Work Compensation','3','Understanding salary structures for remote positions.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('2','Job Search Strategies That Work','2','Proven strategies to enhance your job search efforts.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0),('20','Adapting to Changes in the Job Market','6','How to stay relevant in an evolving labor market.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('21','Finding Your Passion at Work','1','How to discover and align your passion with your career.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('22','10 Resume Mistakes to Avoid','2','Common resume pitfalls and how to fix them.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('23','Negotiating Salary Effectively','3','Tips for securing the best compensation package.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('24','Mastering Technical Interviews','4','How to prepare for and excel in technical interviews.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('25','Transitioning from Student to Professional','5','Navigating the challenges of starting your first job.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('26','AI and the Future of Work','6','Exploring how AI is shaping the job market.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('27','Setting Career Goals That Stick','1','How to create and achieve meaningful career goals.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('28','Freelancing vs Full-Time Work','2','Weighing the pros and cons of freelancing and traditional employment.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','draft',1,0),('29','Understanding Employee Benefits','3','A guide to common workplace benefits and perks.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('3','Understanding Compensation Packages','3','Details on evaluating salary, benefits, and bonuses.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,0),('30','Building Your Professional Network','5','Strategies for expanding your connections in the industry.','2025-01-10 18:30:33','admin','2025-01-10 18:30:33.000000','admin','published',1,0),('4','Industry-Specific Knowledge: IT Sector','4','A deep dive into IT industry trends and skills.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('5','Preparing for Your First Job','5','Essential tips for entering the workforce.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,1),('6','Top Recruitment Trends in 2025','6','Analysis of current recruitment trends and predictions.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,1),('7','How to Build Your Personal Brand','1','The importance of personal branding in career success.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','draft',1,1),('8','Networking Tips for Job Seekers','2','How to effectively network for career opportunities.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0),('9','Navigating Remote Work Compensation','3','Understanding salary structures for remote positions.','2025-01-10 13:28:21','admin','2025-01-10 13:28:21.000000','admin','published',1,0);
/*!40000 ALTER TABLE `career_handbook` ENABLE KEYS */;
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
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES ('1','TechCorp','123 Silicon Valley, CA','https://www.techcorp.com','A leading technology company','logo1.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','500',1,NULL,'1000-2000 Nhân viên'),('10','FashionX','321 Style St, NY','https://www.fashionx.com','Fashion retail and online shopping','logo10.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','600',1,NULL,'500 - 600 Nhân viên'),('1f223c0f-ce9e-11ef-9430-2cf05db24bc7','TechRecruiters Inc.','123 Tech St, Silicon Valley','www.techrecruiters.com','Tech recruitment firm','logo1.png','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin','John Doe',1,NULL,'300 Nhân viên'),('1f224ed5-ce9e-11ef-9430-2cf05db24bc7','JobsNow Ltd.','456 Jobs Ave, New York','www.jobsnow.com','Job listings company','logo2.png','2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin','Jane Smith',1,NULL,NULL),('2','HealthPlus','456 Medical St, NY','https://www.healthplus.com','Innovative healthcare solutions','logo2.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','300',1,NULL,NULL),('3','EduLearn','789 Education Blvd, TX','https://www.edulearn.com','Online learning platform','logo3.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','200',1,NULL,NULL),('4','GreenWorld','321 Green Rd, FL','https://www.greenworld.com','Eco-friendly products and services','logo4.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','150',1,NULL,NULL),('5','FoodiePro','654 Food Lane, CA','https://www.foodiepro.com','Gourmet food delivery service','logo5.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','100',1,NULL,NULL),('6','FinTech Solutions','987 Financial Ave, NY','https://www.fintech.com','Innovative financial technologies','logo6.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','250',1,NULL,NULL),('7','AutoMotors','123 Car St, MI','https://www.automotors.com','Automobile manufacturing and sales','logo7.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','800',1,NULL,NULL),('8','SmartHome','456 Home Ave, CA','https://www.smarthome.com','Smart home devices and services','logo8.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','400',1,NULL,NULL),('9','CyberTech','789 Cyber Rd, TX','https://www.cybertech.com','Cybersecurity and tech consulting','logo9.png','2025-01-10 11:28:37','admin','2025-01-10 11:28:37.000000','admin','350',1,NULL,NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(255) NOT NULL,
  `bot_id` varchar(255) NOT NULL,
  `completed_at` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `updated_at` datetime DEFAULT NULL,
  `last_error` json NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bot_id` (`bot_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`bot_id`) REFERENCES `bots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `parent_id` varchar(36) DEFAULT NULL,
  `category_icon` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`category_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `cv_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `cv_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cv_categories`
--

LOCK TABLES `cv_categories` WRITE;
/*!40000 ALTER TABLE `cv_categories` DISABLE KEYS */;
INSERT INTO `cv_categories` VALUES ('cat-it','Công nghệ thông tin',NULL,'it-icon.png',3,1),('cat-marketing','Marketing, Truyền thông',NULL,'marketing-icon.png',2,1),('cat-sales','Kinh doanh / Bán hàng',NULL,'sales-icon.png',1,1),('pos-developer','Kỹ sư phần mềm','cat-it','developer-icon.png',1,1),('pos-marketing','Chuyên viên Marketing','cat-marketing','marketing-exec-icon.png',1,1),('pos-sales-exec','Nhân viên bán hàng','cat-sales','sales-exec-icon.png',1,1),('pos-sales-manager','Giám đốc kinh doanh','cat-sales','sales-manager-icon.png',2,1);
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
INSERT INTO `cv_field_values` VALUES ('value-001','cv-user-001','field-001','Nguyễn Văn A','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-002','cv-user-001','field-002','Frontend Developer','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-003','cv-user-001','field-003','nguyenvana@email.com','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-004','cv-user-001','field-004','0123456789','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-005','cv-user-001','field-005','Hà Nội','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-006','cv-user-001','field-006','Đại học ABC...','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-007','cv-user-001','field-007','Công ty XYZ...','2025-01-14 13:37:26','2025-01-14 13:37:26'),('value-008','cv-user-001','field-008','HTML, CSS, JavaScript...','2025-01-14 13:37:26','2025-01-14 13:37:26');
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
INSERT INTO `cv_templates` VALUES ('template-basic-01','CV Cơ bản','Mẫu CV đơn giản, chuyên nghiệp phù hợp mọi ngành nghề','\n<div class=\"cv-template-basic\">\n  <!-- Header with Avatar -->\n  <div class=\"cv-header\">\n    <div class=\"header-content\">\n      <h1 class=\"fullname\">{{fullname}}</h1>\n      <div class=\"title\">{{title}}</div>\n      <div class=\"objective\">{{objective}}</div>\n    </div>\n    <div class=\"avatar-container\">\n      <div class=\"avatar\">{{avatar}}</div>\n    </div>\n  </div>\n\n  <!-- Personal Information -->\n  <div class=\"personal-info\">\n    <div class=\"info-item\">\n      <i class=\"fas fa-envelope\"></i>\n      <span>{{email}}</span>\n    </div>\n    <div class=\"info-item\">\n      <i class=\"fas fa-phone\"></i>\n      <span>{{phone}}</span>\n    </div>\n    <div class=\"info-item\">\n      <i class=\"fas fa-globe\"></i>\n      <span>{{website}}</span>\n    </div>\n    <div class=\"info-item\">\n      <i class=\"fas fa-map-marker-alt\"></i>\n      <span>{{address}}</span>\n    </div>\n  </div>\n\n  <!-- Main Content -->\n  <div class=\"cv-content\">\n    <!-- Education Section -->\n    <section class=\"education-section\">\n      <h2>HỌC VẤN</h2>\n      <div class=\"content\">\n        <div class=\"education-item\">\n          <div class=\"school\">{{school}}</div>\n          <div class=\"major\">{{major}}</div>\n          <div class=\"period\">{{education_period}}</div>\n          <div class=\"gpa\">{{gpa}}</div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Experience Section -->\n    <section class=\"experience-section\">\n      <h2>KINH NGHIỆM LÀM VIỆC</h2>\n      <div class=\"content\">\n        <div class=\"experience-item\">\n          <div class=\"period\">{{work_period}}</div>\n          <div class=\"position\">{{position}}</div>\n          <div class=\"company\">{{company}}</div>\n          <ul class=\"responsibilities\">\n            {{responsibilities}}\n          </ul>\n        </div>\n      </div>\n    </section>\n\n    <!-- Skills Section -->\n    <section class=\"skills-section\">\n      <h2>CÁC KỸ NĂNG</h2>\n      <div class=\"content\">\n        <div class=\"skills-list\">\n          {{skills}}\n        </div>\n      </div>\n    </section>\n  </div>\n</div>\n','\n.cv-template-basic {\nmagin-top: 50px,\n  padding: 40px;\n  font-family: Arial, sans-serif;\n  color: #333;\n  background: white;\n\n  .cv-header {\n    display: flex;\n    justify-content: space-between;\n    margin-bottom: 30px;\n    \n    .header-content {\n      flex: 1;\n      \n      .fullname {\n        font-size: 32px;\n        color: #013a74;\n        font-weight: bold;\n        margin-bottom: 10px;\n      }\n      \n      .title {\n        font-size: 18px;\n        color: #333;\n        margin-bottom: 15px;\n        padding-bottom: 5px;\n        border-bottom: 2px solid #013a74;\n        display: inline-block;\n      }\n      \n      .objective {\n        color: #666;\n        line-height: 1.6;\n      }\n    }\n    \n    .avatar-container {\n      width: 150px;\n      height: 150px;\n      margin-left: 30px;\n      \n      .avatar {\n        width: 100%;\n        height: 100%;\n        border-radius: 50%;\n        background: #f0f0f0;\n      }\n    }\n  }\n\n  .personal-info {\n    background: #f8f9fa;\n    padding: 15px;\n    margin-bottom: 30px;\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 10px;\n    \n    .info-item {\n      display: flex;\n      align-items: center;\n      gap: 10px;\n      color: #666;\n      \n      i {\n        color: #013a74;\n      }\n    }\n  }\n\n  section {\n    margin-bottom: 25px;\n    \n    h2 {\n      color: #013a74;\n      font-size: 18px;\n      font-weight: bold;\n      margin-bottom: 15px;\n      padding-bottom: 5px;\n      border-bottom: 2px solid rgba(1, 58, 116, 0.1);\n    }\n    \n    .content {\n      color: #444;\n      line-height: 1.6;\n    }\n  }\n\n  .experience-item {\n    margin-bottom: 20px;\n    \n    .period {\n      color: #02a346;\n      font-weight: 500;\n      margin-bottom: 5px;\n    }\n    \n    .position {\n      font-weight: bold;\n      margin-bottom: 5px;\n    }\n    \n    .company {\n      color: #666;\n      margin-bottom: 10px;\n    }\n    \n    .responsibilities {\n      padding-left: 20px;\n      \n      li {\n        margin-bottom: 5px;\n      }\n    }\n  }\n\n  .skills-list {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n    gap: 15px;\n  }\n}\n','basic-template-thumb.png',1,'2025-01-14 13:36:32','admin',1),('template-basic-010','CV Cơ bản','Mẫu CV đơn giản, chuyên nghiệp phù hợp mọi ngành nghề','...','...','basic-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-basic-02','Thanh lịch','Mẫu CV thanh lịch với layout cân đối','...','...','basic-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-01','CV Sáng tạo','Mẫu CV hiện đại dành cho ngành sáng tạo','<div class=\"creative-cv\">\n    <aside class=\"sidebar\">{{profile}} {{contact}}</aside>\n    <main class=\"content\">{{sections}}</main>\n</div>','.creative-cv {display: grid; grid-template-columns: 30% 70%}\n.sidebar {background: #2c3e50; color: white}','creative-template-thumb.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-010','CV Sáng tạo','Mẫu CV hiện đại dành cho ngành sáng tạo','...','...','creative-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-02','Sáng tạo Pink','Mẫu CV màu hồng cho ngành sáng tạo','...','...','creative-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-creative-03','Sáng tạo Blue','Mẫu CV xanh dương hiện đại','...','...','creative-template-03.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-01','Tối giản','Mẫu CV tối giản với thiết kế hiện đại','\n<div class=\"cv-modern-1\">\n  <div class=\"sidebar\">\n    <div class=\"avatar\">{{avatar}}</div>\n    <div class=\"contact-info\">\n      <div class=\"info-item\">{{email}}</div>\n      <div class=\"info-item\">{{phone}}</div>\n      <div class=\"info-item\">{{address}}</div>\n    </div>\n    <div class=\"skills-section\">\n      <h3>KỸ NĂNG</h3>\n      {{skills}}\n    </div>\n  </div>\n\n  <div class=\"main-content\">\n    <div class=\"header\">\n      <h1>{{fullname}}</h1>\n      <div class=\"title\">{{title}}</div>\n    </div>\n\n    <div class=\"section\">\n      <h2>KINH NGHIỆM LÀM VIỆC</h2>\n      {{experience}}\n    </div>\n\n    <div class=\"section\">\n      <h2>HỌC VẤN</h2> \n      {{education}}\n    </div>\n  </div>\n</div>\n','...','modern-template-01.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-02','Hiện đại 1','CV hiện đại với cách bố trí thông minh','...','...','modern-template-02.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-03','Tinh tế 2','Mẫu CV tinh tế phù hợp nhiều vị trí','...','...','modern-template-03.png',1,'2025-01-14 13:36:32','admin',1),('template-modern-04','Hiện đại 4','CV hiện đại với điểm nhấn màu sắc','...','...','modern-template-04.png',1,'2025-01-14 13:36:32','admin',1);
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
  `status` enum('Đang xét duyệt','Đã phỏng vấn','Đã nhận','Đã từ chối') DEFAULT 'Đang xét duyệt',
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
INSERT INTO `job_applications` VALUES ('1','1f2a1511-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đang xét duyệt',NULL,NULL),('2','1f2a19fb-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đã phỏng vấn',NULL,NULL),('3','1f2a1f84-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đã nhận',NULL,NULL),('4','1f2a2488-ce9e-11ef-9430-2cf05db24bc7',5,'resume_1.pdf','Đã từ chối',NULL,NULL),('5','1f2a2488-ce9e-11ef-9430-2cf05db24bc7',2,'resume_1.pdf','Đã nhận',NULL,NULL);
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
INSERT INTO `job_skills` VALUES ('1f29e210-ce9e-11ef-9430-2cf05db24bc7','1f366a6b-ce9e-11ef-9430-2cf05db24bc7'),('1f29e210-ce9e-11ef-9430-2cf05db24bc7','1f36858f-ce9e-11ef-9430-2cf05db24bc7'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','1f368875-ce9e-11ef-9430-2cf05db24bc7'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','1f3689ba-ce9e-11ef-9430-2cf05db24bc7');
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
  `status` enum('Active','Closed') DEFAULT 'Active',
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
INSERT INTO `jobs` VALUES ('1f29e210-ce9e-11ef-9430-2cf05db24bc7','Software Engineer','Develop and maintain software applications for various platforms. Collaborate with teams to design and implement new features.','100000-120000','New York, NY','2-4 years','Health Insurance, 401k','Proficient in JavaScript, React, Node.js','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a1511-ce9e-11ef-9430-2cf05db24bc7','Data Scientist','Analyze data to provide insights and drive decision-making. Work with machine learning models and algorithms.','110000-130000','San Francisco, CA','3-5 years','Health Insurance, Paid Time Off','Proficient in Python, R, and machine learning algorithms','Full-time','On-site','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e912-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,1,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a19fb-ce9e-11ef-9430-2cf05db24bc7','Project Manager','Lead projects from inception to completion. Manage teams, timelines, and client expectations.','90000-110000','Los Angeles, CA','5+ years','Health Insurance, 401k, Bonuses','Experience in project management tools, excellent communication skills','Full-time','Hybrid','Closed','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ea73-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,4,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','Marketing Specialist','Develop and execute marketing strategies to promote our brand and products.','70000-90000','Austin, TX','2-4 years','Health Insurance, Paid Time Off','Experience with SEO, digital marketing, and social media platforms','Full-time','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-16 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,5,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a2488-ce9e-11ef-9430-2cf05db24bc7','Sales Executive','Identify and build relationships with potential clients. Close deals and achieve sales targets.','60000-80000','Chicago, IL','2-4 years','Commission-based, Health Insurance','Excellent communication and negotiation skills','Full-time','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ed2a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a2abd-ce9e-11ef-9430-2cf05db24bc7','UX Designer','Create user-centered designs for digital products. Work closely with developers and product managers.','80000-100000','Seattle, WA','2-3 years','Health Insurance, 401k','Proficient in Figma, Sketch, and wireframing tools','Full-time','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ec4e-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,4,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a3006-ce9e-11ef-9430-2cf05db24bc7','Human Resources Specialist','Manage recruitment, employee relations, and payroll functions.','70000-85000','Boston, MA','3-5 years','Health Insurance, Paid Leave','Strong knowledge of HR software and labor laws','Full-time','On-site','Closed','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ee06-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a335b-ce9e-11ef-9430-2cf05db24bc7','Customer Support Representative','Provide customer support via email, chat, and phone. Resolve customer issues and queries.','40000-50000','Phoenix, AZ','1-2 years','Health Insurance, Paid Time Off','Strong communication skills, experience with CRM systems','Full-time','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eec3-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,4,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a36f4-ce9e-11ef-9430-2cf05db24bc7','Web Developer','Build and maintain websites. Collaborate with designers and back-end developers.','80000-100000','Dallas, TX','2-4 years','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript','Full-time','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,5,'Quản lý / Giám sát','Đại Học trở lên'),('1f2a3abb-ce9e-11ef-9430-2cf05db24bc7','Mobile Developer','Develop mobile applications for iOS and Android platforms. Ensure app performance and reliability.','95000-120000','San Jose, CA','3+ years','Health Insurance, Paid Time Off','Experience with Swift, Kotlin, React Native','Full-time','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25f02b-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,1,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d5ed3-ce9e-11ef-9430-2cf05db24bc7','Backend Developer','Develop server-side applications and APIs, optimize databases and ensure system scalability.','95000-115000','Chicago, IL','3-5 years','Health Insurance, 401k','Proficient in Node.js, Express, MongoDB','Full-time','On-site','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,2,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6786-ce9e-11ef-9430-2cf05db24bc7','AI Engineer','Design and implement artificial intelligence algorithms and models to improve automation and decision-making processes.','120000-150000','San Francisco, CA','4-6 years','Health Insurance, Paid Time Off','Proficient in Python, TensorFlow, deep learning','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e912-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6b01-ce9e-11ef-9430-2cf05db24bc7','Content Marketing Manager','Plan and execute content marketing strategies to enhance the company’s digital presence and engagement.','80000-100000','Los Angeles, CA','3-5 years','Health Insurance, Bonuses','Experience in content creation, SEO, and analytics','Full-time','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d6df4-ce9e-11ef-9430-2cf05db24bc7','Graphic Designer','Create visual designs for marketing materials, digital ads, and website content to engage customers.','70000-90000','Miami, FL','2-4 years','Health Insurance, Paid Time Off','Proficient in Adobe Creative Suite, Illustrator, Photoshop','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ec4e-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d72a4-ce9e-11ef-9430-2cf05db24bc7','Sales Manager','Manage a sales team, develop strategies, and oversee sales targets and performance in the company.','100000-130000','Boston, MA','5+ years','Health Insurance, Bonuses','Experience in sales team management, CRM tools, negotiation','Full-time','On-site','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ed2a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7753-ce9e-11ef-9430-2cf05db24bc7','Frontend Developer','Develop and maintain the client-side of web applications, collaborate with designers for UI/UX implementation.','90000-110000','New York, NY','2-4 years','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript, React','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7ada-ce9e-11ef-9430-2cf05db24bc7','HR Manager','Oversee HR operations, recruitment, employee relations, and ensure a positive company culture.','85000-105000','Dallas, TX','4-6 years','Health Insurance, Paid Leave','Strong knowledge of labor laws, HR software','Full-time','On-site','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ee06-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d7e4c-ce9e-11ef-9430-2cf05db24bc7','Customer Support Specialist','Assist customers with inquiries, troubleshoot issues, and provide solutions via chat, email, or phone.','40000-50000','Seattle, WA','1-2 years','Health Insurance, Paid Time Off','Strong communication skills, experience with CRM systems','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25eec3-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d82a5-ce9e-11ef-9430-2cf05db24bc7','Mobile App Developer','Develop cross-platform mobile applications, focus on Android and iOS platforms for optimized performance.','100000-120000','San Jose, CA','3-5 years','Health Insurance, 401k','Experience with React Native, Swift, Kotlin','Full-time','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25f02b-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d87c0-ce9e-11ef-9430-2cf05db24bc7','Cloud Engineer','Design, implement, and manage cloud infrastructure to ensure optimal cloud computing services.','110000-140000','Houston, TX','3-5 years','Health Insurance, Paid Leave','Experience with AWS, Azure, and cloud security practices','Full-time','On-site','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d8b76-ce9e-11ef-9430-2cf05db24bc7','Full Stack Developer','Develop both front-end and back-end components for dynamic web applications. Optimize user experience and functionality.','100000-130000','Atlanta, GA','3-5 years','Health Insurance, Bonuses','Proficient in JavaScript, Node.js, React, and SQL databases','Full-time','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25e3ee-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d8edd-ce9e-11ef-9430-2cf05db24bc7','SEO Specialist','Optimize website content for search engines, improve ranking, and increase traffic.','70000-90000','Chicago, IL','2-4 years','Health Insurance, 401k','Proficient in SEO tools like Google Analytics, SEMrush','Full-time','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9225-ce9e-11ef-9430-2cf05db24bc7','Product Manager','Lead the product development cycle from concept to delivery, coordinate with cross-functional teams.','110000-130000','Boston, MA','5+ years','Health Insurance, Paid Time Off','Experience in Agile methodologies, product management tools','Full-time','Hybrid','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25ea73-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d963a-ce9e-11ef-9430-2cf05db24bc7','Digital Marketing Specialist','Develop and implement digital marketing campaigns across various online platforms to increase brand awareness.','75000-95000','New York, NY','2-4 years','Health Insurance, Paid Time Off','Experience with Google Ads, Facebook Ads, and email marketing','Full-time','Remote','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25eb8c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9b1d-ce9e-11ef-9430-2cf05db24bc7','Frontend UI Developer','Design and implement the user interface for web applications, focus on delivering high-quality user experience.','85000-105000','Austin, TX','2-4 years','Health Insurance, 401k','Proficient in HTML, CSS, JavaScript, React','Full-time','Hybrid','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25ef7a-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2d9e91-ce9e-11ef-9430-2cf05db24bc7','Network Engineer','Maintain and optimize network infrastructure, troubleshoot network issues, and ensure secure connectivity.','90000-110000','Los Angeles, CA','3-5 years','Health Insurance, 401k','Experience with routers, firewalls, and VPNs','Full-time','On-site','Active','1f224ed5-ce9e-11ef-9430-2cf05db24bc7','1f25fb0c-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên'),('1f2da3fc-ce9e-11ef-9430-2cf05db24bc7','Security Analyst','Monitor and protect network systems from cyber threats, perform vulnerability assessments, and enforce security policies.','95000-120000','Miami, FL','3-5 years','Health Insurance, Paid Leave','Experience in cybersecurity tools, incident response','Full-time','Remote','Active','1f223c0f-ce9e-11ef-9430-2cf05db24bc7','1f25f0db-ce9e-11ef-9430-2cf05db24bc7','2025-01-09 22:26:39.000000',NULL,'2025-01-09 22:26:39','admin','2025-01-09 22:26:39.000000','admin',1,NULL,'Quản lý / Giám sát','Đại Học trở lên');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
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
INSERT INTO `recruiter_companies` VALUES ('1',21,'1'),('2',22,'2'),('4',23,'3'),('5',24,'4'),('6',25,'5'),('7',26,'6');
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
INSERT INTO `saved_jobs` VALUES ('1',5,'1f2a1f84-ce9e-11ef-9430-2cf05db24bc7',NULL),('2',5,'1f2d9225-ce9e-11ef-9430-2cf05db24bc7',NULL),('3',5,'1f2d87c0-ce9e-11ef-9430-2cf05db24bc7',NULL);
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
-- Table structure for table `template_categories`
--

DROP TABLE IF EXISTS `template_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_categories` (
  `template_id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  PRIMARY KEY (`template_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `template_categories_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `cv_templates` (`template_id`),
  CONSTRAINT `template_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `cv_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_categories`
--

LOCK TABLES `template_categories` WRITE;
/*!40000 ALTER TABLE `template_categories` DISABLE KEYS */;
INSERT INTO `template_categories` VALUES ('template-basic-010','pos-developer'),('template-creative-01','pos-developer'),('template-creative-010','pos-developer'),('template-creative-03','pos-developer'),('template-modern-01','pos-developer'),('template-modern-02','pos-developer'),('template-modern-03','pos-developer'),('template-basic-01','pos-marketing'),('template-basic-010','pos-marketing'),('template-basic-02','pos-marketing'),('template-creative-01','pos-marketing'),('template-creative-010','pos-marketing'),('template-creative-02','pos-marketing'),('template-modern-02','pos-marketing'),('template-modern-04','pos-marketing'),('template-basic-01','pos-sales-exec'),('template-basic-010','pos-sales-exec'),('template-basic-02','pos-sales-exec');
/*!40000 ALTER TABLE `template_categories` ENABLE KEYS */;
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
INSERT INTO `template_fields` VALUES ('field-001','template-basic-01','fullname','text','Họ và tên','Nguyễn Văn A',1,'personal',1),('field-002','template-basic-01','title','text','Vị trí ứng tuyển','Frontend Developer',2,'personal',1),('field-003','template-basic-01','email','text','Email','example@email.com',3,'personal',1),('field-004','template-basic-01','phone','text','Số điện thoại','0123456789',4,'personal',1),('field-005','template-basic-01','address','text','Địa chỉ','Hà Nội',5,'personal',0),('field-006','template-basic-01','education','rich_text','Học vấn','Đại học ABC (2018-2022)\nChuyên ngành: Công nghệ thông tin\nGPA: 3.5/4',6,'education',1),('field-007','template-basic-01','experience','rich_text','Kinh nghiệm làm việc','Công ty XYZ (2022-nay)\nVị trí: Frontend Developer\n- Phát triển website sử dụng React\n- Tối ưu hiệu suất ứng dụng',7,'experience',1),('field-008','template-basic-01','skills','textarea','Kỹ năng','HTML, CSS, JavaScript\nReact, Vue.js\nGit, Docker',8,'skills',1);
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
  `variant_html` text,
  `variant_css` text,
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
INSERT INTO `template_type_variants` VALUES ('variant-001','template-basic-01','type-professional','<div class=\"cv-pro\">...HTML cho style chuyên nghiệp...</div>','.cv-pro { font-family: \"Times New Roman\"; color: #333; }','pro-thumb.png',1),('variant-002','template-basic-01','type-simple','<div class=\"cv-simple\">...HTML cho style đơn giản...</div>','.cv-simple { font-family: Arial; color: #000; }','simple-thumb.png',1),('variant-003','template-basic-01','type-creative','<div class=\"cv-creative\">...HTML cho style sáng tạo...</div>','.cv-creative { font-family: \"Open Sans\"; color: #2c3e50; }','creative-thumb.png',1),('variant-004','template-creative-01','type-professional','<div class=\"cv-creative\">...HTML cho style sáng tạo...</div>','.cv-creative { font-family: \"Open Sans\"; color: #2c3e50; }','creative-thumb.png',1),('variant-005','template-creative-01','type-simple','<div class=\"cv-creative\">...HTML cho style sáng tạo...</div>','.cv-creative { font-family: \"Open Sans\"; color: #2c3e50; }','creative-thumb.png',1),('variant-006','template-creative-01','type-creative','<div class=\"cv-creative\">...HTML cho style sáng tạo...</div>','.cv-creative { font-family: \"Open Sans\"; color: #2c3e50; }','creative-thumb.png',1),('variant-007','template-creative-01','type-modern','<div class=\"cv-creative\">...HTML cho style sáng tạo...</div>','.cv-creative { font-family: \"Open Sans\"; color: #2c3e50; }','creative-thumb.png',1),('variant-basic-010','template-basic-01','type-professional','...','...','basic-01-prof.png',1),('variant-basic-02','template-basic-01','type-simple','...','...','basic-01-simple.png',1),('variant-creative-010','template-creative-01','type-creative','...','...','creative-01.png',1),('variant-creative-02','template-creative-02','type-creative','...','...','creative-02.png',1),('variant-creative-03','template-creative-03','type-creative','...','...','creative-03.png',1),('variant-modern-01','template-modern-01','type-modern','...','...','modern-01.png',1),('variant-modern-02','template-modern-02','type-modern','...','...','modern-02.png',1),('variant-modern-03','template-modern-03','type-modern','...','...','modern-03.png',1),('variant-modern-04','template-modern-04','type-modern','...','...','modern-04.png',1);
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
  `conversation_id` varchar(255) NOT NULL,
  `token_count` int NOT NULL,
  `bot_id` varchar(255) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
INSERT INTO `user_cvs` VALUES ('cv-user-001',5,'template-basic-01','CV xin việc Frontend','{\"skills\": \"HTML, CSS, JavaScript...\", \"personal\": {\"email\": \"nguyenvana@email.com\", \"phone\": \"0123456789\", \"title\": \"Frontend Developer\", \"address\": \"Hà Nội\", \"fullname\": \"Nguyễn Văn A\"}, \"education\": \"Đại học ABC...\", \"experience\": \"Công ty XYZ...\"}','<div class=\"cv-container\">...</div>','published','2025-01-14 13:37:09','2025-01-14 13:37:09'),('cv-user-002',5,'template-creative-01','CV xin việc Frontend','{\"skills\": \"HTML, CSS, JavaScript...\", \"personal\": {\"email\": \"nguyenvana@email.com\", \"phone\": \"0123456789\", \"title\": \"Frontend Developer\", \"address\": \"Hà Nội\", \"fullname\": \"Nguyễn Văn A\"}, \"education\": \"Đại học ABC...\", \"experience\": \"Công ty XYZ...\"}','<div class=\"cv-container\">...</div>','published','2025-01-14 13:37:09','2025-01-14 13:37:09');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'0398397591','Huynh Minh Ha','user','thaopro','hadep12a@gmail.com',1,0,NULL,'$2a$08$SCw/htG.Ab49l.tKgI84dOHRY3SWM/Rq4Eu90evtflscv9Hg0IO3e','2024-11-20 04:35:32','2024-11-20 04:35:32',1),(2,'0335190587','Huynh Minh Ha','admin','minhha2k3','hahuynh.ou@gmail.com',1,0,NULL,'$2a$08$MkAcMxfnlp2/zQwkESMTrOSa2yXw4MW0lIS0btoRjJZt4.MZeLrom','2024-11-20 07:39:25','2024-11-20 07:39:25',1),(3,'0398397590','Huỳnh Minh Hà','user','minhha2k4','hadep8a@gmail.com',1,0,NULL,'$2a$08$7a56GxvZTtVNWb.Rw6Gx4e2EMd6NmPQm1zihU590gL6KMr6OvmHbm','2024-11-22 07:28:29','2024-11-22 07:28:29',1),(4,'0398397592','Huỳnh Minh Hà','user','minhha2k5','hadep2a@gmail.com',1,0,NULL,'$2a$08$ba7CauJvQFXzvck/..gJaeaLQRvvwWAVm9avvHiydmKmZxI0tKw2S','2024-11-22 07:33:10','2024-11-22 07:33:10',1),(5,'0398397599','Nguyen duc vi','admin','ngducvi','hadep20a@gmail.com',1,0,NULL,'$2a$08$S4ke4IVYv0zsD0Zs1aeePO8HJijsnHrIMjUbNI1FjXdNgOBJRi6mS','2024-11-23 01:27:13','2024-12-17 03:46:21',1),(6,'0398397598','Huỳnh Minh Hà','user','minhha2k11','hadep9a@gmail.com',1,0,NULL,'$2a$08$t0Jn3ke7mlIRiw05/iRCjuUy0UdYgqjktYSwPPv8c5P9CCTctC8G6','2024-11-23 01:56:28','2024-11-23 01:56:28',1),(7,'0398397596','Huỳnh Minh Hà','user','minhha2k100','hadep7a@gmail.com',1,0,NULL,'$2a$08$yInAOTb5muZMK/nGnuipJOJotunO531n4gniGCyGCB5BkuDYVqVem','2024-11-29 03:32:18','2024-11-29 03:32:18',1),(8,'0399730616','Dep trai','user','ducvi','ngducvicc@gmail.com',1,0,NULL,'$2a$08$p44yvL44EiqObTmhY1hqZ.oDfxcP2Yqor6VdrNU5EcQlhHeTM39.6','2024-12-17 10:13:49','2024-12-17 10:13:49',1),(9,'0384754154','ngducvi','recruiter','Ngducvi','ngducviccgc@gmail.com',1,0,NULL,'$2a$08$3VQbBwEojPUEefKU2FfGleZwhRwN26WjU41fgU1.V8DL68WOpXTD2','2024-12-24 08:33:55','2024-12-24 08:33:55',1),(10,'0123456789','Admin User','admin','admin_user','admin@example.com',1,1,NULL,'adminpassword','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(11,'0123456790','Recruiter One','recruiter','recruiter1','recruiter1@example.com',1,1,NULL,'recruiterpassword1','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(12,'0123456791','Recruiter Two','recruiter','recruiter2','recruiter2@example.com',1,1,NULL,'recruiterpassword2','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(13,'0123456792','Applicant One','user','applicant1','applicant1@example.com',1,1,NULL,'password1','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(14,'0123456793','Applicant Two','user','applicant2','applicant2@example.com',1,1,NULL,'password2','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(15,'0123456794','Applicant Three','user','applicant3','applicant3@example.com',1,1,NULL,'password3','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(16,'0123456795','Applicant Four','user','applicant4','applicant4@example.com',1,1,NULL,'password4','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(17,'0123456796','Applicant Five','user','applicant5','applicant5@example.com',1,1,NULL,'password5','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(18,'0123456797','Applicant Six','user','applicant6','applicant6@example.com',1,1,NULL,'password6','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(19,'0123456798','Applicant Seven','user','applicant7','applicant7@example.com',1,1,NULL,'password7','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(20,'0123456799','Applicant Eight','user','applicant8','applicant8@example.com',1,1,NULL,'password8','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(21,'0123456800','Applicant Nine','recruiter','applicant9','applicant9@example.com',1,1,NULL,'password9','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(22,'0123456801','Applicant Ten','recruiter','applicant10','applicant10@example.com',1,1,NULL,'password10','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(23,'0123456802','Applicant Eleven','recruiter','applicant11','applicant11@example.com',1,1,NULL,'password11','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(24,'0123456803','Applicant Twelve','recruiter','applicant12','applicant12@example.com',1,1,NULL,'password12','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(25,'0123456804','Applicant Thirteen','recruiter','applicant13','applicant13@example.com',1,1,NULL,'password13','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(26,'0123456805','Applicant Fourteen','recruiter','applicant14','applicant14@example.com',1,1,NULL,'password14','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(27,'0123456806','Applicant Fifteen','user','applicant15','applicant15@example.com',1,1,NULL,'password15','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(28,'0123456807','Applicant Sixteen','user','applicant16','applicant16@example.com',1,1,NULL,'password16','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(29,'0123456808','Applicant Seventeen','user','applicant17','applicant17@example.com',1,1,NULL,'password17','2025-01-09 22:26:39','2025-01-09 22:26:39',1),(30,'0123456809','Applicant Eighteen','user','applicant18','applicant18@example.com',1,1,NULL,'password18','2025-01-09 22:26:39','2025-01-09 22:26:39',1);
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
INSERT INTO `viewed_jobs` VALUES ('1',5,'1f2a1511-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00'),('2',5,'1f2a19fb-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00'),('3',5,'1f2a1f84-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00'),('4',5,'1f2a2488-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00'),('5',6,'1f2a2488-ce9e-11ef-9430-2cf05db24bc7','2024-11-27 00:00:00');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
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

-- Dump completed on 2025-01-15 19:33:43
-- thêm bảng category_jobs
