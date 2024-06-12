const express = require('express');
const inquirer = require('inquirer');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const pool = new Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.connect()
    .then(() => console.log(`Connected to the employees_db database.`))
    .catch(err => console.error('Error connecting to the database:', err));

// Main menu prompt
const mainMenu = async () => {
    const choices = [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Exit',
    ];

    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
    });

    return action;
};

// Function to view all employees
const viewAllEmployees = async () => {
    try {
        const result = await pool.query('SELECT id, first_name, last_name, role_id, manager_id FROM employee');
        console.table(result.rows);
    } catch (err) {
        console.error('Error retrieving employees:', err);
    }
};

// Function to add an employee
const addEmployee = async () => {
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter the first name of the new employee:' },
        { type: 'input', name: 'lastName', message: 'Enter the last name of the new employee:' },
        { type: 'input', name: 'roleId', message: 'Enter the role ID for the new employee:' },
        { type: 'input', name: 'managerId', message: 'Enter the manager ID for the new employee (if any):' }
    ]);
    try {
        const result = await pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, roleId, managerId]
        );
        console.log('Employee added:', result.rows[0]);
    } catch (err) {
        console.error('Error adding employee:', err);
    }
};

// Function to update an employee role
const updateEmployeeRole = async () => {
    const { employeeId, newRoleId } = await inquirer.prompt([
        { type: 'input', name: 'employeeId', message: 'Enter the employee ID:' },
        { type: 'input', name: 'newRoleId', message: 'Enter the new role ID:' }
    ]);
    try {
        const result = await pool.query(
            'UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *',
            [newRoleId, employeeId]
        );
        console.log('Employee role updated:', result.rows[0]);
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
};

// Function to view all roles
const viewAllRoles = async () => {
    try {
        const result = await pool.query('SELECT id, title, salary, department_id FROM role');
        console.table(result.rows);
    } catch (err) {
        console.error('Error retrieving roles:', err);
    }
};

// Function to add a role
const addRole = async () => {
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the title of the new role:' },
        { type: 'input', name: 'salary', message: 'Enter the salary of the new role:' },
        { type: 'input', name: 'departmentId', message: 'Enter the department ID for the new role:' }
    ]);
    try {
        const result = await pool.query(
            'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *',
            [title, salary, departmentId]
        );
        console.log('Role added:', result.rows[0]);
    } catch (err) {
        console.error('Error adding role:', err);
    }
};

// Function to view all departments
const viewAllDepartments = async () => {
    try {
        const result = await pool.query('SELECT id, name FROM department');
        console.table(result.rows);
    } catch (err) {
        console.error('Error retrieving departments:', err);
    }
};

// Function to add a department
const addDepartment = async () => {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the new department:',
    });
    try {
        const result = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [name]);
        console.log('Department added:', result.rows[0]);
    } catch (err) {
        console.error('Error adding department:', err);
    }
};

// Initialize application
const init = async () => {
    let exit = false;
    while (!exit) {
        const action = await mainMenu();

        // Handle different menu options using if statements
        if (action === 'View All Departments') {
            await viewAllDepartments();
        } else if (action === 'View All Roles') {
            await viewAllRoles();
        } else if (action === 'View All Employees') {
            await viewAllEmployees();
        } else if (action === 'Add Department') {
            await addDepartment();
        } else if (action === 'Add Role') {
            await addRole();
        } else if (action === 'Add Employee') {
            await addEmployee();
        } else if (action === 'Update Employee Role') {
            await updateEmployeeRole();
        } else if (action === 'Exit') {
            exit = true;
            console.log('Goodbye!');
        }
    }
    pool.end();  // Close the database connection
};

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    init();
});
