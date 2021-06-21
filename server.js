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
                choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "Exit"]
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
        case "Add Employee":
            await addEmployee();
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

async function viewAllEmployees() {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id', async (err, res) => {
        if (err) throw err;
        console.table(res);
        startingOptions();
    })
}

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
        connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id AND department.name = ?', [response.role_id], (err, res) => {
            if (err) throw err;
            console.table(res);
            startingOptions();
        })
    })
}

// NEED TO DO
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
        connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id AND employee.manager_id = ?', [employee_id], (err, res) => {
            if (err) throw err;
            console.table(res);
            startingOptions();
        })

    })
}

// PSEUDOCODE
// GET LIST OF ALL EMPLOYEES
// QUERY FOR ALL EMPLOYEES WHERE MANAGERID IS CHOSEN EMPLOYEE

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
    })
}

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
                department_id = department.name;
            }
        })
        connection.query("INSERT INTO role (title, salary, department_id)VALUES (?, ?, ?);", [response.title, response.salary, department_id]);
        startingOptions();
    })

}

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

        // const manager_response = await inquirer.prompt(
        //     [
        //         {
        //             name: "has_Manager",
        //             message: "Do they have a manager?: ",
        //             type: "confirm"
        //         }
        //     ]
        // )

        // NEED TO CHECK HOW TO VIEW BY MANAGER

        connection.query('INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);', [name_response.first_name, name_response.last_name, role_id]);
        startingOptions();
    })

}

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