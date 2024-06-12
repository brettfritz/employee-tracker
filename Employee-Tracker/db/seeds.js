const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new pool
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost/${process.env.DB_NAME}`;

const pool = new Pool({connectionString});
console.log('Connection String:', connectionString);

// Read the JSON file
const seedsPath = path.join(__dirname, 'seeds.json');
const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

const seedDatabase = async () => {
    try {
        // Insert departments
        for (const department of seeds.departments) {
            await pool.query('INSERT INTO department (name) VALUES ($1)', [department.name]);
        }

        // Insert roles
        for (const role of seeds.roles) {
            await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [role.title, role.salary, role.department_id]);
        }

        // Insert employees
        for (const employee of seeds.employees) {
            await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [employee.first_name, employee.last_name, employee.role_id, employee.manager_id]);
        }

        console.log('Database seeded successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        pool.end();
    }
};

seedDatabase();
