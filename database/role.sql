DROP DATABASE IF EXISTS roleDB;

CREATE DATABASE roleDB;

USE DATABASE roleDB;

create table role (
    id INT NOT NULL AUTO_INCREMENT
    title VARCHAR(30)
    salary DECIMAL
    department_id INT
);
