-- MySQL dump 10.13  Distrib 9.0.1, for macos14.4 (x86_64)
--
-- Host: localhost    Database: bookly_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `google_books_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `book_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_author` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_cover` text COLLATE utf8mb4_unicode_ci,
  `book_overview` text COLLATE utf8mb4_unicode_ci,
  `book_released_date` date DEFAULT NULL,
  `book_rated_average` double DEFAULT NULL,
  `book_created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `book_updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `books_google_books_id_key` (`google_books_id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (5,'Mmtn9-YpF6EC','Empowerment of Women Through Self Help Groups','G. Sreeramulu',NULL,'The book is an in-depth study of Empowerment of Women Through Self Help Groups. It covers the problems and perspectives of Self Help Groups and suggest several measures. The study has evaluated the implementation of several schemes in Anantapur District in particular and in Andhra Pradesh in general such as rearing goats, dairying, petty business activities, making of soft toys and so on. The findings are very much encouraging, such as Women are now managing their families, Panchayat Raj Institutions, are able to concentrate on their children s education and health. Contents include: Introduction, Public Policy Theoretical Perspectives, Evaluation, Aims and Objectctives of Self Help Groups in Anantapur District, Socio-Economic Background of the Sample Study, Problems and perspectives of Self Help Groups, Performance of Self Help Groups and Conclusion. This outstanding Text-cum-Reference book will be of great use to Scholars, Administrators, Planners, Policy-makers, Statesmen and Students of Political Science, Economics, Sociology, Commerce and Women Studites.','2006-01-01',NULL,'2024-11-21 20:50:56.129','2024-11-21 20:50:56.129'),(6,'0g1mDwAAQBAJ','Real-Time Rendering, Fourth Edition','Tomas Akenine-Mo ̈ller','http://books.google.com/books/publisher/content?id=0g1mDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE7242iSweETypMjipPlOFZUJfXrnnn3E4joL-tA2CHU7VhXu7utNZmfDpUrCQngW7YHodupSjgLlJLQdoSSDw2GUeNJKloNTwuXsnC_NP3OzPnkAaOZt3SFL7Rxtg-WvEiu2LuVI&source=gbs_api','<p>Thoroughly updated, this fourth edition focuses on modern techniques used to generate synthetic three-dimensional images in a fraction of a second. With the advent of programmable shaders, a wide variety of new algorithms have arisen and evolved over the past few years. This edition discusses current, practical rendering methods used in games and other applications. It also presents a solid theoretical framework and relevant mathematics for the field of interactive computer graphics, all in an approachable style.</p><p><b>New to this edition: </b>new chapter on VR and AR as well as expanded coverage of Visual Appearance, Advanced Shading, Global Illumination, and Curves and Curved Surfaces.</p>','2018-08-06',NULL,'2024-11-22 02:34:34.103','2024-11-22 02:34:34.103'),(11,'VdhAAQAAQBAJ','Visible Learning and the Science of How We Learn','John Hattie','http://books.google.com/books/publisher/content?id=VdhAAQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70Za5K1uY8XbajNwvMkfVtHosB39Fg1v5aLSpiRTji1gQvYvn_WWQu6GK90kQhVFv0WxNKgHr-8Lcfxphv0j3Hzptqq6ZV_FC0nVR6tYSjgZjE86ya3q8mJWoK3J0VLj0WIvqr5&source=gbs_api','<p>On publication in 2009 John Hattie’s <i>Visible Learning</i> presented the biggest ever collection of research into what actually work in schools to improve children’s learning. Not what was fashionable, not what political and educational vested interests wanted to champion, but what actually produced the best results in terms of improving learning and educational outcomes. It became an instant bestseller and was described by the TES as revealing education’s ‘holy grail’. </p><p>Now in this latest book, John Hattie has joined forces with cognitive psychologist Greg Yates to build on the original data and legacy of the Visible Learning project, showing how it’s underlying ideas and the cutting edge of cognitive science can form a powerful and complimentary framework for shaping learning in the classroom and beyond.</p><p>Visible Learning and the Science of How We Learn explains the major principles and strategies of learning, outlining why it can be so hard sometimes, and yet easy on other occasions. Aimed at teachers and students, it is written in an accessible and engaging style and can be read cover to cover, or used on a chapter-by-chapter basis for essay writing or staff development. </p><p>The book is structured in three parts – ‘learning within classrooms’, ‘learning foundations’, which explains the cognitive building blocks of knowledge acquisition and ‘know thyself’ which explores, confidence and self-knowledge. It also features extensive interactive appendices containing study guide questions to encourage critical thinking, annotated bibliographic entries with recommendations for further reading, links to relevant websites and YouTube clips. Throughout, the authors draw upon the latest international research into how the learning process works and how to maximise impact on students, covering such topics as:</p><ul> <p> </p> <li>teacher personality;</li> <p> </p> <li>expertise and teacher-student relationships;</li> <p> </p> <li>how knowledge is stored and the impact of cognitive load;</li> <p> </p> <li>thinking fast and thinking slow;</li> <p> </p> <li>the psychology of self-control;</li> <p> </p> <li>the role of conversation at school and at home;</li> <p> </p> <li>invisible gorillas and the IKEA effect;</li> <p> </p> <li>digital native theory;</li> <p> </p> <li>myths and fallacies about how people learn.</li> </ul><p>This fascinating book is aimed at any student, teacher or parent requiring an up-to-date commentary on how research into human learning processes can inform our teaching and what goes on in our schools. It takes a broad sweep through findings stemming mainly from social and cognitive psychology and presents them in a useable format for students and teachers at all levels, from preschool to tertiary training institutes. </p>','2013-10-08',NULL,'2024-11-27 04:47:00.349','2024-11-27 04:47:00.349'),(13,'WADDM36d3TAC','The Discarded Image','C. S. Lewis','http://books.google.com/books/content?id=WADDM36d3TAC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72kt7Ukieujyo-lu7EgYxTg-LrNrcSuzNdTbyaer-eYQaEAfSxUCVT0J_GDgTn8HU8JtU8wHBeFbwdiu9dBZ70quiGEkvv2OPd6XDET9q0mBivTrNDCYNpcqbw9FqGb1VM17Sz6&source=gbs_api','C.S. Lewis\' The Discarded Image paints a lucid picture of the medieval world view, as historical and cultural background to the literature of the Middle Ages and Renaissance. It describes the \"image\" discarded by later ages as \"the medieval synthesis itself, the whole organization of their theology, science and history into a single, complex, harmonious mental model of the universe.\" This, Lewis\' last book, was hailed as \"the final memorial to the work of a great scholar and teacher and a wise and noble mind.\"','1994-08-26',NULL,'2024-11-27 04:47:26.553','2024-11-27 04:47:26.553'),(53,'y80BAAAAQAAJ','The Children\'s Voyage, Or, A Trip in the Water Fairy','Anne Jane Cupples','http://books.google.com/books/content?id=y80BAAAAQAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73bF5bmVSguaWotxcpd5WwaUB1_wZ5bTedQJwzzZelSNWElQHD4RMuy7CWTrRAMtswh5ScKCk2U2hIleHkHCFrh4EHFzwHB_jcvPx0P0XV80tD8c76pAw9sG0qG6aYu9VetmRm3&source=gbs_api','','1873-01-01',NULL,'2024-11-30 04:33:29.933','2024-11-30 04:33:29.933'),(66,'3hpFDwAAQBAJ','Be Kind','Pat Zietlow Miller','http://books.google.com/books/publisher/content?id=3hpFDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70qEQtAFw-kJIKIJeLZOtTqQ_2UrayV2b6ICf1DQb8x2yKcfj6UyiRDuP0YyxywveH-5LT8tijbIS_suMDBf8JD8eoGXfIb-PyM_Ow_60h_4PR1CKxgGRf1U-pi5g5_X32NTsdJ&source=gbs_api','<p><b>A <i>New York Times</i> bestseller!</b><br><br><b>“These days, it seems more important than ever for books to show young people how to act with thoughtfulness, civility, and kindness.” —<i>The New York Times Book Review</i><br></b><br>When Tanisha spills grape juice all over her new dress, her classmate wants to make her feel better, wondering: <i>What does it mean to be kind? </i><br><br>From asking the new girl to play to standing up for someone being bullied, this moving story explores what kindness is, and how any act, big or small, can make a difference—or at least help a friend.<br><br>With a gentle text from the award-winning author of <i>Sophie\'s Squash</i>, Pat Zietlow Miller, and irresistible art from Jen Hill, <i>Be Kind </i>is an unforgettable story about how two simple words can change the world.<br><br><b>One of Chicago Public Library\'s \"Best of the Best Books 2018\"</b></p>','2018-02-06',NULL,'2024-11-30 04:57:55.238','2024-11-30 04:57:55.238'),(67,'Uu-mswEACAAJ','Contextualizing Openness','Leslie Chan','http://books.google.com/books/content?id=Uu-mswEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70HY4BHIk62B4H8N1SfhhB-j0QkwR5WANorLxKnjoar15qdEWag447wgeM_xwnEuJ-1KbxP0x37Vj_fCGZZ88pSm0XzyKeP2RbNsG2fXkc0_Rrs9CF6qbkA-ka74m6I5ZaUq5od&source=gbs_api','\"An important part of identifying the structural, technical, policy and cultural contexts for Open Science in the Global South is recognizing the plurality and diversity in the framing and meanings of \"openness.\" This volume brings together contributions from the twelve projects that form the Open and Collaborative Science in Development Network (OCSDN), and is organized along four themes: Defining Open Science in Development, Governing Open Science, Negotiating Open Science, and Expanding Open Science for Social Transformation. The collective goal of this volume is to identify examples and reflections that illustrate how opportunities and challenges posed by openness vary across regions, and to identify key differences between actors, institutions, infrastructure and governance of knowledge-based resources in diverse settings. The volume will contribute to and expand upon the literature on \"openness,\" which has largely been written from the standpoint of the Global North. Challenging the asymmetry of global knowledge production and access is central to understanding the growing movement towards Open Science and what it may mean for development thinking and practices. The intent is to further stimulate research and debates on how best to collectively design a knowledge system that is open and equitable for all\"--Page 4 of cover.','2019-01-01',NULL,'2024-11-30 05:03:31.149','2024-11-30 05:03:31.149'),(68,'AKV5CwAAQBAJ','My Fight / Your Fight','Ronda Rousey','http://books.google.com/books/publisher/content?id=AKV5CwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73yVBGigCVloYMqUzslnRU_y5_vZ52lwo0g4zfpPN8hrfVJ7UebE9l3v4F4cWOoICoktZO5z5ZpCTLJEs88xfOgAqCUr2A5aZG1g8boYxnY2HPmQOMcv8PkphAb7IvRKd-Nbttk&source=gbs_api','<b>THE ONLY OFFICIAL RONDA ROUSEY BOOK</b><br> <br><b>“The fight is yours to win.”</b><br> <br> <b>In this inspiring and moving book, Ronda Rousey, the Olympic medalist in judo, reigning UFC women\'s bantamweight champion, and Hollywood star charts her difficult path to glory. </b><br><br>Marked by her signature charm, barbed wit, and undeniable power, Rousey’s account of the toughest fights of her life—in and outside the Octagon—reveals the painful loss of her father when she was eight years old, the intensity of her judo training, her battles with love, her meteoric rise to fame, the secret behind her undefeated UFC record, and what it takes to become the toughest woman on Earth. Rousey shares hard-won lessons on how to be the best at what you do, including how to find fulfillment in the sacrifices, how to turn limitations into opportunities, and how to be the best on your worst day.<br> <br> Packed with raw emotion, drama, and wisdom, this is an unforgettable book by one of the most remarkable women in the world.','2015-05-12',NULL,'2024-11-30 05:03:52.791','2024-11-30 05:03:52.791');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `review_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `review_updated_at` datetime(3) DEFAULT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `reviews_user_id_fkey` (`user_id`),
  KEY `reviews_book_id_fkey` (`book_id`),
  CONSTRAINT `reviews_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (5,'good book!','2024-11-30 04:58:06.507',NULL,2,66),(6,'great book! love it!','2024-11-30 05:04:26.484',NULL,2,68);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `user_updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_user_email_key` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'rmwyyy@gmail.com','$2b$10$UMIS6Bt3lu/d40TGUNek4.YA8BkfrnO9IpN3P8wtqoRe5i66gYCmO','yaoyi',NULL,NULL,'2024-11-21 18:31:55.359','2024-11-21 18:31:55.359'),(2,'aaa@a.com','$2b$10$UmaB17XHPnEIgmMNpBnYMeIuZWbmadIAM/.rRmE21NuWqxGHoiD06','aaa',NULL,NULL,'2024-11-21 19:21:26.436','2024-11-21 19:21:26.436'),(3,'my@gmail.com','$2b$10$PydVqwN7FumsFppmX7rCjeFIjOWa/7/uuUq1HGuH4W4wHNeNDJXwK','myg',NULL,NULL,'2024-11-30 04:56:14.685','2024-11-30 04:56:14.685');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_favorite_books`
--

DROP TABLE IF EXISTS `users_favorite_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_favorite_books` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `liked_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `users_favorite_books_user_id_book_id_key` (`user_id`,`book_id`),
  KEY `users_favorite_books_book_id_fkey` (`book_id`),
  CONSTRAINT `users_favorite_books_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `users_favorite_books_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_favorite_books`
--

LOCK TABLES `users_favorite_books` WRITE;
/*!40000 ALTER TABLE `users_favorite_books` DISABLE KEYS */;
INSERT INTO `users_favorite_books` VALUES (13,'2024-11-27 04:30:55.802',2,6),(14,'2024-11-30 04:57:58.786',2,66),(15,'2024-11-30 05:04:15.788',2,68);
/*!40000 ALTER TABLE `users_favorite_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_rate_books`
--

DROP TABLE IF EXISTS `users_rate_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_rate_books` (
  `rate_id` int NOT NULL AUTO_INCREMENT,
  `rated_score` double NOT NULL,
  `rated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`rate_id`),
  KEY `users_rate_books_user_id_fkey` (`user_id`),
  KEY `users_rate_books_book_id_fkey` (`book_id`),
  CONSTRAINT `users_rate_books_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `users_rate_books_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_rate_books`
--

LOCK TABLES `users_rate_books` WRITE;
/*!40000 ALTER TABLE `users_rate_books` DISABLE KEYS */;
INSERT INTO `users_rate_books` VALUES (1,4,'2024-11-22 02:33:54.776',2,5,NULL),(3,4,'2024-11-27 04:48:11.335',2,13,NULL),(5,3,'2024-11-30 04:58:06.500',2,66,NULL),(6,4,'2024-11-30 05:04:26.463',2,68,NULL);
/*!40000 ALTER TABLE `users_rate_books` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-29 23:05:37
