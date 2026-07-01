package com.shivam.monocept.repository;

import com.shivam.monocept.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByDepartmentName(String departmentName);
    boolean existsByDepartmentCode(String departmentCode);
}
