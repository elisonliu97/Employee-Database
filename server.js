// DEPENDENCIES
const mysql = require('mysql')
const inquirer = require('inquirer')

const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',

    password: '',

    database: 'employeeDB',
});

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    startingOptions();
});

async function startingOptions() {
    const response = await inquirer.prompt(
        [
            {
                name: "choices",
                type: "list",
                message: "What would you like to do?: ",
                choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Data", "Remove Employee", "Update Employee Role", "Update Employee Manager", "Exit"]
            }
        ]
    )
    switch (response.choices) {
        case "View All Employees":
            await viewAllEmployees();
            break;
        case "View All Employees by Department":
            await viewByDepartment();
            break;
        case "View All Employees by Manager":
            await viewByManager();
            break;
        case "Add Data":
            await addOptions();
            break;
        case "Remove Employee":
            await removeEmployee();
            break;
        case "Update Employee Role":
            await updateEmployeeRole();
            break;
        case "Update Employee Manager":
            await updateEmployeeManager();
            break;
        case "Exit":
            connection.end();
            break;
        default:
            console.log("Not a valid option")
            break;
    }
}

// FUNCTION TO VIEW ALL EMPLOYEES
async function viewAllEmployees() {
    connection.query('SELECT e.id as ID, e.first_name as FirstName, e.last_name as LastName, role.title as Title, role.salary as Salary, department.name as Department, CONCAT_WS(" ", s.first_name, s.last_name) AS Manager FROM employee e LEFT JOIN employee s ON s.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY e.id;', async (err, res) => {
        if (err) throw err;
        console.table(res);
        startingOptions();
    })
}

// FUNCTION TO VIEW BY DEPARTMENT
async function viewByDepartment() {
    connection.query('SELECT * FROM department', async (err, res) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: "role_id",
                    message: "What department would you like to check?: ",
                    type: "list",
                    choices: res.map(department => department.name)
                }
            ]
        )
        connection.query('SELECT e.id as ID, e.first_name as FirstName, e.last_name as LastName, role.title as Title, role.salary as Salary, department.name as Department, CONCAT_WS(" ", s.first_name, s.last_name) AS Manager FROM employee e LEFT JOIN employee s ON s.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id AND department.name = ? ORDER BY e.id;', [response.role_id], (err, res) => {
            if (err) throw err;
            console.table(res);
            startingOptions();
        })
    })
}

// FUNCTION TO VIEW BY MANAGER
async function viewByManager() {
    let employee_id
    connection.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: 'employee',
                    message: 'Choose the manager: ',
                    type: 'list',
                    choices: res.map(employee => employee.first_name + " " + employee.last_name)
                }
            ]
        )
        res.forEach((employee) => {
            if (response.employee === employee.first_name + " " + employee.last_name) {
                employee_id = employee.id;
            }
        })
        connection.query('SELECT e.id as ID, e.first_name as FirstName, e.last_name as LastName, role.title as Title, role.salary as Salary, department.name as Department, CONCAT_WS(" ", s.first_name, s.last_name) AS Manager FROM employee e LEFT JOIN employee s ON s.id = e.manager_id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id AND e.manager_id = ? ORDER BY e.id;', [employee_id], (err, res) => {
            if (err) throw err;
            console.table(res);
            startingOptions();
        })

    })
}

// FUNCTION TO ADD A DEPARTMENT
async function addDepartment() {
    const response = await inquirer.prompt(
        [
            {
                name: 'name',
                type: 'input',
                message: 'What department are you adding?: '
            }
        ]
    )
    connection.query('INSERT INTO department (name) VALUES (?)', [response.name], (err, res) => {
        if (err) throw err;
        console.log("Department Added")
        startingOptions();
    })
}

// FUNCTION TO ADD A ROLE
async function addRole() {
    connection.query('SELECT * FROM department', async (err, res) => {
        const response = await inquirer.prompt(
            [
                {
                    name: 'title',
                    type: 'input',
                    message: "What is the title?: "
                },
                {
                    name: 'salary',
                    type: 'number',
                    message: 'What is the salary of the role?: '
                },
                {
                    name: 'department_id',
                    type: 'list',
                    message: 'What department is this under?: ',
                    choices: res.map((department) => department.name)
                }
            ]
        )
        let department_id
        res.forEach((department) => {
            if (department.name === response.department_id) {
                department_id = department.id;
            }
        })
        connection.query("INSERT INTO role (title, salary, department_id)VALUES (?, ?, ?);", [response.title, response.salary, department_id], (err, res) => {
            if (err) throw err;
            console.log('Role Added');
            startingOptions();
        });

    })

}

// FUNCTION TO ADD AN EMPLOYEE
async function addEmployee() {
    connection.query('SELECT * FROM role', async (err, res) => {
        if (err) throw err;
        const name_response = await inquirer.prompt(
            [
                {
                    name: 'first_name',
                    type: 'input',
                    message: 'What is their first name?: '
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: "What is their last name?: "
                }
            ]
        )
        const role_response = await inquirer.prompt(
            [
                {
                    name: "role_id",
                    message: "What role will they have?: ",
                    type: "list",
                    choices: res.map(role => role.title)
                }
            ]
        )
        let role_id
        res.forEach((role) => {
            if (role.title === role_response.role_id) {
                role_id = role.id;
            }
        })

        let manager_id
        connection.query('SELECT * FROM employee', async (err, res) => {
            if (err) throw err;
            let managerArray = res.map(employee => employee.first_name + " " + employee.last_name)
            managerArray.push("None")
            const manager_response = await inquirer.prompt(
                [
                    {
                        name: 'manager',
                        message: 'Choose the manager: ',
                        type: 'list',
                        choices: managerArray
                    }
                ]
            )
            res.forEach((employee) => {
                if (manager_response.manager === employee.first_name + " " + employee.last_name) {
                    manager_id = employee.id;
                }
            })
            connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);', [name_response.first_name, name_response.last_name, role_id, manager_id], (err, res) => {
                if (err) throw err;
                console.log('Employee Added')
                startingOptions();
            });

        })
    })
}

// FUNCTION TO GET OPTIONS TO ADD
async function addOptions() {
    let response = await inquirer.prompt(
        [
            {
                name: 'choice',
                message: "What would you like to add?: ",
                type: 'list',
                choices: ['Employee', 'Role', 'Department']
            }
        ]
    )
    switch (response.choice) {
        case 'Employee':
            await addEmployee();
            break;
        case 'Role':
            await addRole();
            break;
        case 'Department':
            await addDepartment();
            break;
    }
}

// FUNCTION TO UPDATE AN EMPLOYEE'S ROLE
async function updateEmployeeRole() {
    let employee_id
    let role_id
    connection.query('SELECT * FROM employee', async (err, res) => {
        if (err) throw err;
        const employee_response = await inquirer.prompt(
            [
                {
                    name: "employee",
                    message: "Which employee's role would you like to update?: ",
                    type: "list",
                    choices: res.map(employee => employee.first_name + " " + employee.last_name),
                }
            ]
        )
        res.forEach((employee) => {
            if (employee_response.employee === employee.first_name + " " + employee.last_name) {
                employee_id = employee.id;
            }
        })
        connection.query('SELECT * FROM role', async (err, res) => {
            if (err) throw err;
            const role_response = await inquirer.prompt(
                [
                    {
                        name: "role",
                        message: "What will be the new role?: ",
                        type: "list",
                        choices: res.map(role => role.title)
                    }
                ]
            )
            res.forEach((role) => {
                if (role_response.role === role.title) {
                    role_id = role.id
                }
            })
            connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_id, employee_id])
            startingOptions();
        })
    })
}

// NEED TO DO
// CHANGE ADD EMPLOYEE TO ADD EMPLOYEE/ROLE/DEPARTMENT
// REMOVE EMPLOYEE/ROLE/DEPARTMENT
// UPDATE MANAGER
// VIEW TOTAL BUDGET OF DEPARTMENT