-- Data Definition File for Com_Unity

-- Reset Database
SET FOREIGN_KEY_CHECKS = 0;
DROP SCHEMA IF EXISTS `com_unity`;
CREATE SCHEMA `com_unity`;
USE `com_unity`;
SET FOREIGN_KEY_CHECKS = 1;


-- Message meta data table
CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY UNIQUE NOT NULL,
  message_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- user_mood VARCHAR(191) NOT NULL, -- changing to INT for now to use a mapping rather than emoji unicode
  user_mood INT NOT NULL,
  user_name VARCHAR(255),
  user_age INT,
  user_location VARCHAR(255)
)ENGINE=InnoDB;


-- Message voice recording table
CREATE TABLE voices (
  message_id INT PRIMARY KEY UNIQUE NOT NULL,
  voice_message MEDIUMBLOB NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(message_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE=InnoDB;


-- Set database's default charset to handle emojis
ALTER DATABASE com_unity CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Set table's default charset to handle emojis
ALTER TABLE Messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
