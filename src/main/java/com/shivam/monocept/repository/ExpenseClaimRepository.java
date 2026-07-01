package com.shivam.monocept.repository;

import com.shivam.monocept.entity.ExpenseClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.shivam.monocept.enums.ClaimStatus;
import java.math.BigDecimal;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long>, JpaSpecificationExecutor<ExpenseClaim> {

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM ExpenseClaim c " +
           "WHERE c.employee.department.departmentId = :departmentId " +
           "AND FUNCTION('MONTH', c.expenseDate) = :month " +
           "AND FUNCTION('YEAR', c.expenseDate) = :year " +
           "AND c.status = :status")
    BigDecimal sumAmountByDepartmentAndMonthAndYearAndStatus(
            @Param("departmentId") Long departmentId,
            @Param("month") Integer month,
            @Param("year") Integer year,
            @Param("status") ClaimStatus status
    );

    @Query("SELECT COUNT(c) FROM ExpenseClaim c " +
           "WHERE c.employee.department.departmentId = :departmentId " +
           "AND FUNCTION('MONTH', c.expenseDate) = :month " +
           "AND FUNCTION('YEAR', c.expenseDate) = :year " +
           "AND c.status = :status")
    long countByDepartmentAndMonthAndYearAndStatus(
            @Param("departmentId") Long departmentId,
            @Param("month") Integer month,
            @Param("year") Integer year,
            @Param("status") ClaimStatus status
    );

    boolean existsByEmployeeEmployeeId(Long employeeId);
    boolean existsByCategoryCategoryId(Long categoryId);
}
