// DEPENDENCIES
const mysql = require('mysql')
const inquirer = require('inquirer')

// MYSQL CONNECTION
const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',

    password: '',

    database: 'employeeDB',
});

// WHEN CONNECTED TO SERVER RUN THIS
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    startingOptions();
});

// VARIABLES
let viewQuery = 'SELECT e.id as ID, CONCAT_WS(" ", e.first_name, e.last_name) AS Name, '
viewQuery += 'role.title as Title, role.salary as Salary, department.name as Department, '
viewQuery += 'CONCAT_WS(" ", s.first_name, s.last_name) AS Manager FROM employee e '
viewQuery += 'LEFT JOIN employee s ON s.id = e.manager_id INNER JOIN role ON e.role_id = role.id '
viewQuery += 'INNER JOIN department ON role.department_id = department.id'

// FUNCTION TO START THE FIRST INQUIRER PROMPT FOR WHICH OPTION USER WANTS TO TAKE
async function startingOptions() {
    choicesArr = ["View All Employees", "View All Employees by Department",
        "View All Employees by Manager", "Add Data", "Remove Data",
        "Update Employee Role", "Update Employee Manager", "View Department Budget", "Exit"]
    const response = await inquirer.prompt(
        [
            {
                name: "choices",
                type: "list",
                message: "What would you like to do?: ",
                choices: choicesArr
            }
        ]
    )
    // HANDLES CHOICES
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
        case "Remove Data":
            await removeOptions();
            break;
        case "Update Employee Role":
            await updateEmployeeRole();
            break;
        case "Update Employee Manager":
            await updateEmployeeManager();
            break;
        case "View Department Budget":
            await getBudget();
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
    connection.query(viewQuery + ' ORDER BY e.id;', async (err, res) => {
        if (err) throw err;
        console.table(res);
        startingOptions();
    })
}

// FUNCTION TO VIEW BY DEPARTMENT
async function viewByDepartment() {
    connection.query('SELECT * FROM department', async (err, departmentData) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: "department_id",
                    message: "What department would you like to check?: ",
                    type: "list",
                    choices: departmentData.map(department => ({ name: department.name, value: department.id }))
                }
            ]
        )
        connection.query(viewQuery + ' AND department.id = ? ORDER BY e.id;', [response.department_id], (err, finalData) => {
            if (err) throw err;
            console.table(finalData);
            startingOptions();
        })
    })
}

// FUNCTION TO VIEW BY MANAGER
async function viewByManager() {
    connection.query('SELECT * FROM employee', async (err, employeeData) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: 'employee',
                    message: 'Choose the manager: ',
                    type: 'list',
                    choices: employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }))
                }
            ]
        )
        connection.query(viewQuery + ' AND e.manager_id = ? ORDER BY e.id;', [response.employee], (err, finalData) => {
            if (err) throw err;
            console.table(finalData);
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
    connection.query('SELECT * FROM department', async (err, departmentData) => {
        if (err) throw err;
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
                    choices: departmentData.map((department) => department.name)
                }
            ]
        )
        let department_id
        departmentData.forEach((department) => {
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
    connection.query('SELECT * FROM role', async (err, roleData) => {
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
                    choices: roleData.map(role => ({ name: role.title, value: role.id }))
                }
            ]
        )
        connection.query('SELECT * FROM employee', async (err, employeeData) => {
            if (err) throw err;
            let managerArray = employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }))
            managerArray.push("None")
            const manager_response = await inquirer.prompt(
                [
                    {
                        name: 'manager_id',
                        message: 'Choose the manager: ',
                        type: 'list',
                        choices: managerArray
                    }
                ]
            )
            if (manager_response.manager_id === 'None'){
                manager_response.manager_id = null
            }
            connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);', [name_response.first_name, name_response.last_name, role_response.role_id, manager_response.manager_id], (err, res) => {
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
    connection.query('SELECT * FROM employee', async (err, employeeData) => {
        if (err) throw err;
        const employee_response = await inquirer.prompt(
            [
                {
                    name: "employee_id",
                    message: "Which employee's role would you like to update?: ",
                    type: "list",
                    choices: employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id })),
                }
            ]
        )
        connection.query('SELECT * FROM role', async (err, roleData) => {
            if (err) throw err;
            const role_response = await inquirer.prompt(
                [
                    {
                        name: "role_id",
                        message: "What will be the new role?: ",
                        type: "list",
                        choices: roleData.map(role => ({ name: role.title, value: role.id }))
                    }
                ]
            )
            connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_response.role_id, employee_response.employee_id], (err, res) => {
                if (err) throw err;
                console.log("Updated Employee's Role")
                startingOptions();
            })
        })
    })
}

// FUNCTION TO UPDATE MANAGER
async function updateEmployeeManager() {
    connection.query('SELECT * FROM employee', async (err, employeeData) => {
        if (err) throw err;
        const employee_response = await inquirer.prompt(
            [
                {
                    name: "employee_id",
                    message: "Which employee's manager would you like to update?: ",
                    type: "list",
                    choices: employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id })),
                },
                {
                    name: "manager_id",
                    message: "Who will be their new manager?: ",
                    type: "list",
                    choices: employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id })),
                }
            ]
        )
        connection.query('UPDATE employee SET manager_id = ? WHERE id = ?', [employee_response.manager_id, employee_response.employee_id], (err, res) => {
            if (err) throw err;
            console.log("Updated Employee's Manager")
            startingOptions();
        })
    })
}

async function removeOptions() {
    let response = await inquirer.prompt(
        [
            {
                name: 'choice',
                message: "What would you like to remove?: ",
                type: 'list',
                choices: ['Employee', 'Role', 'Department']
            }
        ]
    )
    switch (response.choice) {
        case 'Employee':
            await removeEmployee();
            break;
        case 'Role':
            await removeRole();
            break;
        case 'Department':
            await removeDepartment();
            break;
    }
}

// FUNCTION TO REMOVE EMPLOYEE
// NOTE CANNOT DELETE MANAGERS YET
async function removeEmployee() {
    connection.query('SELECT * FROM employee', async (err, employeeData) => {
        if (err) throw err;
        const employee_response = await inquirer.prompt(
            [
                {
                    name: "employee_id",
                    message: "Which employee is being removed?: ",
                    type: "list",
                    choices: employeeData.map(employee => ({ name: employee.first_name + " " + employee.last_name, value: employee.id })),
                }
            ]
        )
        connection.query('DELETE FROM employee WHERE ?', [{ "employee.id": employee_response.employee_id }], (err, res) => {
            if (err) throw err;
            console.log('DELETED EMPLOYEE');
            startingOptions();
        })
    })
}

// FUNCTION TO REMOVE ROLE
async function removeRole() {
    connection.query('SELECT * FROM role', async (err, roleData) => {
        if (err) throw err;
        const role_response = await inquirer.prompt(
            [
                {
                    name: "role_id",
                    message: "Which role is being removed?: ",
                    type: "list",
                    choices: roleData.map(role => ({name:role.title,value:role.id})),
                }
            ]
        )
        connection.query('DELETE FROM role WHERE ?', [{ "role.id": role_response.role_id }], (err, res) => {
            if (err) throw err;
            console.log('DELETED ROLE');
            startingOptions();
        })
    })
}

// FUNCTION TO REMOVE DEPARTMENT
async function removeDepartment() {
    connection.query('SELECT * FROM department', async (err, departmentData) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: "department",
                    message: "Which department is being removed?: ",
                    type: "list",
                    choices: departmentData.map(department => ({name:department.name,value:department.id})),
                }
            ]
        )
        connection.query('DELETE FROM department WHERE ?', [{ "department.id": response.department }], (err, res) => {
            if (err) throw err;
            console.log('DELETED DEPARTMENT');
            startingOptions();
        })
    })
}

// FUNCTION TO GET TOTAL BUDGET OF A DEPARTMENT
async function getBudget() {
    let budget = 0
    connection.query('SELECT * FROM department', async (err, departmentData) => {
        if (err) throw err;
        const response = await inquirer.prompt(
            [
                {
                    name: "department_id",
                    message: "What department would you like to check?: ",
                    type: "list",
                    choices: departmentData.map(department => ({name:department.name,value:department.id})),
                }
            ]
        )
        connection.query(viewQuery + ' AND department.id =  ?', [response.department_id], (err, finalData) => {
            if (err) throw err;
            finalData.forEach((employee) => {
                budget += employee.Salary
            })
            console.log("The budget for this department is $" + budget)
            startingOptions();
        })
    })
}