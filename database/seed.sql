USE employeeDB;

INSERT INTO department (name)
VALUES ('Coding');

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Software Developer", 150000, 1);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Bob", "Boberton", 1);


INSERT INTO department (name)
VALUES ('Marketing');

INSERT INTO role (title, salary, department_id)
VALUES ("Marketing Genius", 200000, 2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES("Lily", "Little", 2);



INSERT INTO role (title, salary, department_id)
VALUES ("Software Developer", 100000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Rob", "Robson", 3, 1);
