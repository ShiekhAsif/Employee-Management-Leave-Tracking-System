# Employee Management & Leave Tracking System

A full-stack placement/interview portfolio project built with **React + TypeScript**, **Spring Boot**, **Spring Security**, **JWT**, **Spring Data JPA / Hibernate**, and **MySQL**.

## Features

- JWT-based login with BCrypt password hashing.
- Role-based authorization with `ADMIN` and `EMPLOYEE` roles.
- Admin dashboard and employee directory.
- Employee create, read, update, and delete operations.
- Input validation and duplicate-email protection.
- Employees can see their own profile and submit/view/cancel pending leave requests.
- Admins can view all leave requests and approve/reject them.
- Responsive React dashboard and API error messages.
- Demo admin and employee accounts are seeded automatically on first startup.

## Requirements

- JDK 21 or newer (the backend is configured for Java 21; Spring Boot 3.5 supports Java 17+).
- Maven 3.6.3 or newer.
- MySQL 8.x (or a compatible MySQL server).
- Node.js 20.19+ or 22.12+ and npm.
- IntelliJ IDEA for the backend and VS Code (or IntelliJ) for the frontend.

## 1. Configure MySQL

Start your MySQL server and run `database.sql` in MySQL Workbench, or execute:

```sql
CREATE DATABASE employee_management_db;
```

Open `backend/src/main/resources/application.properties` and update these values if needed:

```properties
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

The defaults assume your MySQL username is `root` and the password is blank. If you use a password, either update the property directly for local development or set the `DB_PASSWORD` environment variable.

Hibernate creates and updates the tables automatically with `spring.jpa.hibernate.ddl-auto=update`. This setting is convenient for local learning; use a managed migration tool such as Flyway or Liquibase for a production application.

## 2. Run the backend in IntelliJ IDEA

1. Extract the ZIP file.
2. Open IntelliJ IDEA and choose **File → Open**.
3. Select the `backend` folder (or open the root folder and import `backend/pom.xml` as a Maven project).
4. Set the Project SDK to JDK 21 or newer.
5. Allow IntelliJ to import/download Maven dependencies.
6. Check the MySQL credentials in `application.properties`.
7. Open `src/main/java/com/asif/ems/EmployeeManagementApplication.java` and click the green Run icon beside `main()`.
8. Wait for Spring Boot to start on `http://localhost:8080`.

If you prefer the terminal, open a terminal in the `backend` folder and run:

```bash
mvn spring-boot:run
```

### Demo login accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@12345` |
| Employee | `employee@example.com` | `Employee@123` |

Demo users are created automatically if those email addresses do not already exist. Change/remove demo credentials before using the app beyond local development.

## 3. Run the frontend

Open a terminal in the `frontend` folder and run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The frontend calls the backend at `http://localhost:8080/api` by default. To change that, copy `.env.example` to `.env.local`, edit `VITE_API_URL`, then restart Vite.

For a production frontend build:

```bash
npm run build
```

## API overview

All routes except `POST /api/auth/login` require a valid JWT bearer token.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/employees/me` | Any signed-in user | Current user's profile |
| `GET` | `/api/employees` | Admin | List all employees |
| `POST` | `/api/employees` | Admin | Create employee account |
| `PUT` | `/api/employees/{id}` | Admin | Update employee record |
| `DELETE` | `/api/employees/{id}` | Admin | Delete employee and its leave history |
| `GET` | `/api/leaves` | Signed-in user | Admin sees all; employee sees own requests |
| `POST` | `/api/leaves` | Signed-in user | Submit a leave request |
| `PATCH` | `/api/leaves/{id}/status` | Admin | Approve or reject a request |
| `DELETE` | `/api/leaves/{id}` | Admin or owner | Delete request; employees may cancel pending requests only |

For protected API calls, send the header:

```http
Authorization: Bearer <token>
```

A successful login returns JSON with `token`, `id`, `fullName`, `email`, and `role`.

## IntelliJ + VS Code workflow

- Keep the backend open in IntelliJ and run `EmployeeManagementApplication`.
- Keep the frontend open in VS Code and run `npm run dev` in its terminal.
- Keep MySQL running while testing the app.
- Start backend first, then frontend.

## Important security notes

This repository is a local learning/demo starter, not a production-ready deployment. Before deployment:

- Set a strong, private `JWT_SECRET` environment variable (at least 32 bytes) and rotate the demo account passwords.
- Use HTTPS and configure CORS with only your real frontend origin.
- Do not store secrets in source control.
- Add account creation/reset flows, audit logging, rate limiting, and database migrations as required by your organization.
- Consider moving the token from local storage to a more secure session strategy depending on the deployment's threat model.

## Troubleshooting

- **Access denied / login fails:** check email and password, and confirm the backend started without errors.
- **Cannot connect to MySQL:** confirm MySQL is running, the database exists, and username/password are correct.
- **CORS error:** open the frontend on `http://localhost:5173`; the backend allows that development origin by default.
- **Port already in use:** change `server.port` in `application.properties` or the port in `frontend/vite.config.ts` and update the frontend URL as needed.
- **Maven dependencies do not load:** use IntelliJ's Maven tool window and choose **Reload All Maven Projects**.

## Tech stack

Java 21 · Spring Boot 3.5 · Spring Security · JWT (JJWT) · Spring Data JPA · Hibernate · MySQL · React · TypeScript · Vite · Axios

## Application Screenshots

### Dashboard

![Employee Management Dashboard][E:\employee-management-leave-tracking-system\screenshorts\Screenshot 2026-10-18 115926.png]

### Employee Directory

![Employee Directory][E:\employee-management-leave-tracking-system\screenshorts\Screenshot 2026-10-18 115932.png]

### Leave Requests

![Leave Requests][screenshorts/Screenshot 2026-10-18 115937.png]
