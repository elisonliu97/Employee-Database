DROP DATABASE IF EXISTS departmentDB;

CREATE DATABASE departmentDB;

USE DATABASE departmentDB;

create table department (
    id INT NOT NULL AUTO_INCREMENT
    name VARCHAR(30)
);
