CREATE DATABASE IF NOT EXISTS employee_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_management_db;

-- Hibernate creates/updates the employees and leave_applications tables on first run.
-- Demo accounts are automatically seeded by the Spring Boot application.
