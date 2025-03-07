CREATE DATABASE recipeDB;

USE recipeDB;

CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT,
    instructions TEXT,
    thumbnail_url VARCHAR(255),
    video_url VARCHAR(255)
);
