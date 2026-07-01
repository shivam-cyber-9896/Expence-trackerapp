package com.shivam.monocept.repository;

import com.shivam.monocept.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    boolean existsByCategoryName(String categoryName);
}
