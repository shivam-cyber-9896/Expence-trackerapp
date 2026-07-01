package com.shivam.monocept.config;

import com.shivam.monocept.entity.Department;
import com.shivam.monocept.entity.Employee;
import com.shivam.monocept.entity.ExpenseCategory;
import com.shivam.monocept.entity.ExpenseClaim;
import com.shivam.monocept.entity.ClaimReview;
import com.shivam.monocept.enums.Role;
import com.shivam.monocept.enums.ClaimStatus;
import com.shivam.monocept.repository.DepartmentRepository;
import com.shivam.monocept.repository.EmployeeRepository;
import com.shivam.monocept.repository.ExpenseCategoryRepository;
import com.shivam.monocept.repository.ExpenseClaimRepository;
import com.shivam.monocept.repository.ClaimReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final ExpenseClaimRepository expenseClaimRepository;
    private final ClaimReviewRepository claimReviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure ADMINISTRATION department exists
        Department adminDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDepartmentCode().equalsIgnoreCase("ADMIN"))
                .findFirst()
                .orElseGet(() -> {
                    Department dept = new Department();
                    dept.setDepartmentName("ADMINISTRATION");
                    dept.setDepartmentCode("ADMIN");
                    dept.setLocation("Headquarters");
                    return departmentRepository.save(dept);
                });

        // Ensure FINANCE department exists
        Department financeDept = departmentRepository.findAll().stream()
                .filter(d -> d.getDepartmentCode().equalsIgnoreCase("FIN"))
                .findFirst()
                .orElseGet(() -> {
                    Department dept = new Department();
                    dept.setDepartmentName("FINANCE");
                    dept.setDepartmentCode("FIN");
                    dept.setLocation("Building B");
                    return departmentRepository.save(dept);
                });

        // Ensure admin user exists
        Optional<Employee> adminEmployeeOpt = employeeRepository.findByEmail("admin@expense.com");
        if (adminEmployeeOpt.isEmpty()) {
            Employee admin = new Employee();
            admin.setEmployeeName("Admin User");
            admin.setEmail("admin@expense.com");
            admin.setPhone("9999999999");
            admin.setDesignation("System Administrator");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setDepartment(adminDept);
            employeeRepository.save(admin);
            System.out.println("Seeded admin user: admin@expense.com / admin123");
        }

        // Ensure finance manager user exists
        Optional<Employee> financeEmployeeOpt = employeeRepository.findByEmail("finance@expense.com");
        if (financeEmployeeOpt.isEmpty()) {
            Employee finance = new Employee();
            finance.setEmployeeName("Finance Manager");
            finance.setEmail("finance@expense.com");
            finance.setPhone("8888888888");
            finance.setDesignation("Finance Manager");
            finance.setPassword(passwordEncoder.encode("finance123"));
            finance.setRole(Role.ROLE_ADMIN);
            finance.setDepartment(financeDept);
            employeeRepository.save(finance);
            System.out.println("Seeded finance manager: finance@expense.com / finance123");
        }

        // Ensure at least one category exists
        ExpenseCategory travelCategory = expenseCategoryRepository.findAll().stream()
                .filter(c -> c.getCategoryName().equalsIgnoreCase("Travel Expenses"))
                .findFirst()
                .orElseGet(() -> {
                    ExpenseCategory cat = new ExpenseCategory();
                    cat.setCategoryName("Travel Expenses");
                    cat.setMaxLimit(new BigDecimal("5000.00"));
                    cat.setDescription("Business flights, hotels, and mileage");
                    return expenseCategoryRepository.save(cat);
                });

        // Ensure at least one standard employee exists
        Employee janeDoe = employeeRepository.findByEmail("jane@expense.com")
                .orElseGet(() -> {
                    Employee emp = new Employee();
                    emp.setEmployeeName("Jane Doe");
                    emp.setEmail("jane@expense.com");
                    emp.setPhone("7777777777");
                    emp.setDesignation("Software Engineer");
                    emp.setPassword(passwordEncoder.encode("employee123"));
                    emp.setRole(Role.ROLE_EMPLOYEE);
                    emp.setDepartment(financeDept);
                    return employeeRepository.save(emp);
                });

        // Seed a rejected claim for Jane Doe
        boolean hasRejectedClaim = expenseClaimRepository.findAll().stream()
                .anyMatch(c -> c.getEmployee().getEmployeeId().equals(janeDoe.getEmployeeId()) && c.getStatus() == ClaimStatus.REJECTED);

        if (!hasRejectedClaim) {
            ExpenseClaim claim = new ExpenseClaim();
            claim.setEmployee(janeDoe);
            claim.setCategory(travelCategory);
            claim.setAmount(new BigDecimal("1250.00"));
            claim.setExpenseDate(LocalDate.now().minusDays(5));
            claim.setDescription("Flight tickets to international tech conference");
            claim.setStatus(ClaimStatus.REJECTED);
            ExpenseClaim savedClaim = expenseClaimRepository.save(claim);

            ClaimReview review = new ClaimReview();
            review.setClaim(savedClaim);
            review.setReviewerName("Finance Manager");
            review.setStatus(ClaimStatus.REJECTED);
            review.setRemarks("Policy violation: International travel requires pre-approval 14 days in advance.");
            claimReviewRepository.save(review);

            System.out.println("Seeded rejected claim for: jane@expense.com");
        }
    }
}
