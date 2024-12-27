CREATE DATABASE my_database;

USE my_database;
SHOW DATABASES;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    mobile_number VARCHAR(15) UNIQUE,
    password VARCHAR(255),
    social_login_provider ENUM('google', 'facebook', 'apple') DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- // manual entry for testing
INSERT INTO users (first_name, last_name, mobile_number, password)
VALUES ('John', 'Doe', '1234567890', '$2y$10$YOUR_HASH_HERE');

SELECT * FROM users


