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
    content TEXT, -- this can be null if the post is only content based
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (photo_id) REFERENCES photos(photo_id)
);

-- user registered into the application
START TRANSACTION;

INSERT INTO users(username, email, password_hash) VALUES('Andrew Symonds', 'andrew.sy@gmail.com', 'iusk97t6gthguw');

SET @last_user_id = LAST_INSERT_ID();

SET @file_path = CONCAT(CURRENT_TIMESTAMP, '.jpeg');
INSERT INTO photos(user_id, image_path) VALUES(@last_user_id, CONCAT(@last_user_id,'/content/images/', ));

SET @last_photo_id = LAST_INSERT_ID();

INSERT INTO profiles(user_id, profile_photo_id, bio, date_of_birth, address, phone) 
    VALUES(@last_user_id, @last_photo_id, 'cricketer', '1985-10-12', 'Sydney', '+21-890756456');

COMMIT;
-- end of transaction

SELECT * FROM users;
SELECT * FROM profiles;
SELECT * FROM photos;

-- Q: how to get all photos (photo IDs) except profile photo given the user ID? 
-- Should have I added additional column called is_profile_photo in 'photos' table and mark 'true' for profile photo
-- and for rest set default as 'false' - this would be unnecessary and simply waste of storage. This could be easily handled 
-- by the application only using the join right query
SELECT 
    p.photo_id 
FROM 
    photos p
INNER JOIN 
    profiles pr ON p.user_id = pr.user_id
WHERE 
    p.user_id = 1 
    AND p.photo_id != pr.profile_photo_id;