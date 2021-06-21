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
        connection.query('SELECT * FROM employee INNER JOIN department ON employee.role_id = department.id AND department.name = ?', [response.role_id], (err, res) => {
            if (err) throw err;
            console.table(res);
        })
        startingOptions();
    })
}

// NEED TO DO
// async function viewByManager() {
// connection.query('SELECT * FROM employee WHERE ')
// }
