-- create a schema for social network entities. Example: users, profiles, posts, photos etc
-- define relationship between them.

-- try inserting data in "users" and "profiles" tables in a single transaction. Scenario is when user registers into 
-- the application, row is created in both tables. 
-- hint: "users" table mostly used for auth, "profiles" table for complete user information.

-- not in current scope:
-- follows or friendships: To manage the social graph (who follows whom).
-- likes or reactions: To track engagement with posts.
-- comments: For threaded discussions on posts.
-- messages: For direct messaging functionality

-- create new database 
CREATE DATABASE IF NOT EXISTS social_media;
USE social_media;

-- create tables
CREATE TABLE users(
    user_id INT AUTO_INCREMENT PRIMARY KEY, 
    username VARCHAR(50) NOT NULL UNIQUE, 
    email VARCHAR(255) NOT NULL UNIQUE, 
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE profiles(
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE, -- MySQL automatically creates an index for any column that is PRIMARY KEY or UNIQUE
    profile_photo_id INT,
    bio TEXT,
    date_of_birth DATE,
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE photos(
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id), -- INDEX on user ID to query all photos for the user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
-- update profiles table to add foreign key on profile photo id
ALTER TABLE profiles ADD CONSTRAINT fk_profile_photo FOREIGN KEY (profile_photo_id) REFERENCES photos(photo_id);

CREATE TABLE posts(
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_id INT, -- if the post is content based
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (photo_id) REFERENCES photos(photo_id)
);

-- pending - transaction sample