# Department Expense Approval System - Backend

This is the backend implementation for the Department Expense Approval System, built using Spring Boot, Spring Security (JWT), Hibernate, and MySQL.

---

## Technical Stack & Configuration
- **Core Technology**: Java 17, Spring Boot 4.1.0, Spring Security 7.1.0, Spring Data JPA
- **Database**: MySQL (5.7 / 8.x)
- **API UI Documentation**: Springdoc OpenAPI / Swagger UI 3.0.3
- **Object Mapping**: ModelMapper 3.2.0

---

## Getting Started

### 1. Database Setup
Ensure you have a MySQL server running and create the schema:
```sql
CREATE DATABASE Expence_Department;
```
The database credentials and configuration details are defined in [application.properties](src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/Expence_Department
spring.datasource.username=root
spring.datasource.password=shivam@9896
spring.jpa.hibernate.ddl-auto=update
```
Hibernate will automatically create and update the table schemas (`departments`, `employees`, `expense_categories`, `expense_claims`, `claim_reviews`, `department_budgets`, `audit_logs`).

### 2. Running the Application
To run the Spring Boot application, execute:
```powershell
.\mvnw.cmd spring-boot:run
```

---

## Authentication & Startup Seeding

The application implements stateless **JWT Authentication**. During application startup, a `CommandLineRunner` seeds a default department and administrator account if they do not exist:
* **Admin Email**: `admin@expense.com`
* **Admin Password**: `admin123`
* **Admin Role**: `ROLE_ADMIN`
* **Default Department**: `ADMINISTRATION` (Code: `ADMIN`)

To call protected REST APIs, authenticate via `/api/auth/login` to retrieve a JWT Token, then set it in your HTTP request headers:
`Authorization: Bearer <your_jwt_token>`

---

## API Endpoints

### 1. Authentication (`/api/auth`)
* `POST /api/auth/register` - Registers a new employee user.
* `POST /api/auth/login` - Authenticates credentials and returns a JWT token.

### 2. Department Management (`/api/departments`)
* `POST /` - Creates a new department.
* `PUT /{id}` - Updates department details.
* `GET /{id}` - Retrieves a department by ID.
* `GET /` - Retrieves paginated departments (supports query parameters `page`, `size`, `sortBy`, `direction`).
* `DELETE /{id}` - Deletes a department.

### 3. Employee Management (`/api/employees`)
* `GET /{id}` - Retrieves an employee by ID.
* `GET /` - Retrieves paginated employees.
* `DELETE /{id}` - Deletes an employee.

### 4. Expense Categories (`/api/categories`)
* `POST /` - Creates a new expense category (e.g. `Travel`, `Office Supplies`) with a maximum transaction limit.
* `PUT /{id}` - Updates category.
* `GET /{id}` - Retrieves a category by ID.
* `GET /` - Retrieves paginated categories.
* `DELETE /{id}` - Deletes a category.

### 5. Expense Claims (`/api/claims`)
* `POST /` - Submits a claim (starts in `PENDING` status). Checks category limits and remaining department budget.
* `PUT /{id}` - Updates a pending claim.
* `GET /{id}` - Retrieves a claim by ID.
* `GET /` - Dynamic claim search (filters by `employeeId`, `departmentId`, `status`, `month`, `year`, `categoryId`, etc. via JPA Specifications).
  * *Security*: Employees are auto-restricted to viewing only their own claims. Admins can view all claims.
* `DELETE /{id}` - Deletes a pending claim.

### 6. Claims Reviews (`/api/reviews`)
* `POST /claims/{claimId}` - Reviews a pending claim (status: `APPROVED` or `REJECTED`).
  * *Rule*: Re-validates that the claim amount does not exceed the remaining monthly department budget upon approval.
* `GET /claims/{claimId}` - Retrieves claim review remarks and date.

### 7. Department Budgets (`/api/budgets`)
* `POST /` - Creates a monthly budget for a department.
* `PUT /{id}` - Updates budget limits.
* `GET /{id}` - Retrieves a budget by ID.
* `GET /` - Retrieves paginated budgets.
* `GET /departments/{departmentId}/summary` - Gets department utilization summary (contains total budget, total approved claims, total pending claims, remaining budget, and status counts).
* `DELETE /{id}` - Deletes a budget.

### 8. System Audits (`/api/audit-logs`)
* `GET /` - Query paginated system transactions (actions logged with user email and timestamps).

---

## Interactive Documentation (Swagger UI)
Interactive API documentation is generated and served at:
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI Doc**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Running Integration Tests
A full end-to-end integration test suite is located in [DepartmentExpenseSystemIntegrationTests.java](src/test/java/com/shivam/monocept/DepartmentExpenseSystemIntegrationTests.java). You can execute the test suite by running:
```powershell
.\mvnw.cmd test
```
