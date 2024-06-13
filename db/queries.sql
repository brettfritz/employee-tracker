
SELECT id, name FROM department;

SELECT id, title, salary, department_id FROM role;

SELECT id, first_name, last_name, role_id, manager_id FROM employee;

INSERT INTO department (name) VALUES ($1) RETURNING *;

INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *;

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;

UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *;
