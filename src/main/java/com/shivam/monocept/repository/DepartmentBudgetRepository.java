package com.shivam.monocept.repository;

import com.shivam.monocept.entity.DepartmentBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentBudgetRepository extends JpaRepository<DepartmentBudget, Long> {
    Optional<DepartmentBudget> findByDepartmentDepartmentIdAndMonthAndYear(Long departmentId, Integer month, Integer year);
    boolean existsByDepartmentDepartmentId(Long departmentId);
}
