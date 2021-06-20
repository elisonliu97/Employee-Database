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
    createProduct();
});

async function startingOptions() {
    const response = inquirer.prompt(
        [
            {
                name: "choices",
                type: "list",
                message: "What would you like to do?: ",
                choices: ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager"]
            }
        ]
    )
    switch(response.choices) {
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
        default:
            console.log("Not a valid option")
            break;
    }
}

async function init() {
    const response = inquirer.prompt()
}