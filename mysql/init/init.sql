CREATE USER IF NOT EXISTS 'user_eval'@'%' IDENTIFIED BY 'ton_mdp';

CREATE DATABASE IF NOT EXISTS wegift_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS wegift_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON wegift_auth.* TO 'user_eval'@'%';
GRANT ALL PRIVILEGES ON wegift_user.* TO 'user_eval'@'%';

FLUSH PRIVILEGES;

USE wegift_auth;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiresAt DATETIME NOT NULL,
    INDEX (userId),
    INDEX (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    acceptedTerms TINYINT(4) NOT NULL,
    newsletter TINYINT(4) NOT NULL,
    isActive TINYINT(1) NOT NULL,
    twoFactorEnabled TINYINT(1) DEFAULT 0,
    twoFactorSecret VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, email, password, acceptedTerms, newsletter, isActive, twoFactorEnabled, twoFactorSecret) VALUES
('user-1-uuid-0001', 'user1@example.com', 'hashedpassword1', 1, 1, 1, 0, NULL),
('user-2-uuid-0002', 'user2@example.com', 'hashedpassword2', 1, 0, 1, 1, 'secret2'),
('user-3-uuid-0003', 'user3@example.com', 'hashedpassword3', 1, 1, 0, 0, NULL),
('user-4-uuid-0004', 'user4@example.com', 'hashedpassword4', 1, 0, 1, 0, NULL),
('user-5-uuid-0005', 'user5@example.com', 'hashedpassword5', 1, 1, 1, 1, 'secret5');

USE wegift_user;

CREATE TABLE IF NOT EXISTS users_profiles (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    userId VARCHAR(36) NOT NULL,
    picture VARCHAR(150) DEFAULT NULL,
    description VARCHAR(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users_profiles (id, firstName, lastName, birthDate, createdAt, updatedAt, userId, picture, description) VALUES
('profile-1-uuid-0001', 'Alice', 'Dupont', '1990-01-01', NOW(), NOW(), 'user-1-uuid-0001', NULL, 'Description 1'),
('profile-2-uuid-0002', 'Bob', 'Martin', '1985-05-15', NOW(), NOW(), 'user-2-uuid-0002', NULL, 'Description 2'),
('profile-3-uuid-0003', 'Clara', 'Moreau', '1992-08-22', NOW(), NOW(), 'user-3-uuid-0003', NULL, 'Description 3'),
('profile-4-uuid-0004', 'David', 'Petit', '1988-03-11', NOW(), NOW(), 'user-4-uuid-0004', NULL, 'Description 4'),
('profile-5-uuid-0005', 'Eva', 'Lemoine', '1995-12-05', NOW(), NOW(), 'user-5-uuid-0005', NULL, 'Description 5');
