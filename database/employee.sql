DROP DATABASE IF EXISTS employeeDB;

CREATE DATABASE employeeDB;

USE DATABASE employeeDB;

create table employees (
    id INT NOT NULL AUTO_INCREMENT
    first_name VARCHAR(30)
    last_name VARCHAR(30)
    role_id INT
    manager_id INT
);
