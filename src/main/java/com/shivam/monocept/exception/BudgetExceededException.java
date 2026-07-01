package com.shivam.monocept.exception;

public class BudgetExceededException extends DepartmentExpenseException {
    public BudgetExceededException(String message) {
        super(message);
    }
}
