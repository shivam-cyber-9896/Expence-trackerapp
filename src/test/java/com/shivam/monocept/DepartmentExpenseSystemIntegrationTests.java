package com.shivam.monocept;

import tools.jackson.databind.ObjectMapper;
import com.shivam.monocept.dto.request.*;
import com.shivam.monocept.enums.ClaimStatus;
import com.shivam.monocept.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
public class DepartmentExpenseSystemIntegrationTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
    }

    @Test
    public void testFullExpenseApprovalWorkflow() throws Exception {
        long uniqueId = System.currentTimeMillis();
        
        // Convert uniqueId to letters to satisfy alphabet-only validations
        String codeSuffix = "";
        long tempCode = uniqueId;
        for (int i = 0; i < 3; i++) {
            codeSuffix += (char) ('A' + (tempCode % 26));
            tempCode /= 26;
        }
        String deptCode = "HR" + codeSuffix; // 5 uppercase letters e.g. HRXYZ

        String nameSuffix = "";
        long tempName = uniqueId;
        while (tempName > 0) {
            nameSuffix += (char) ('A' + (tempName % 26));
            tempName /= 26;
        }
        String deptName = "HUMAN RESOURCES " + nameSuffix;
        String empEmail = "jane.doe." + nameSuffix.toLowerCase() + "@expense.com";
        String empPhone = String.valueOf(8000000000L + (uniqueId % 1000000000L));
        String catName = "Travel Expenses " + nameSuffix;

        // 1. Login as default seeded admin
        LoginRequestDto adminLogin = new LoginRequestDto();
        adminLogin.setEmail("admin@expense.com");
        adminLogin.setPassword("admin123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> adminLoginResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> adminData = (Map<?, ?>) adminLoginResponse.get("data");
        String adminToken = (String) adminData.get("accessToken");
        assertNotNull(adminToken);

        // 2. Create HR department with unique details
        DepartmentRequestDto deptRequest = new DepartmentRequestDto();
        deptRequest.setDepartmentName(deptName);
        deptRequest.setDepartmentCode(deptCode);
        deptRequest.setLocation("Building A");

        MvcResult deptResult = mockMvc.perform(post("/api/departments")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deptRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> deptResponse = objectMapper.readValue(deptResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> deptData = (Map<?, ?>) deptResponse.get("data");
        Number deptIdNum = (Number) deptData.get("departmentId");
        Long departmentId = deptIdNum.longValue();
        assertNotNull(departmentId);

        // 3. Register user with unique details
        EmployeeRequestDto employeeReg = new EmployeeRequestDto();
        employeeReg.setEmployeeName("Jane Doe");
        employeeReg.setEmail(empEmail);
        employeeReg.setPhone(empPhone);
        employeeReg.setDesignation("HR Recruiter");
        employeeReg.setPassword("jane123");
        employeeReg.setRole(Role.ROLE_EMPLOYEE);
        employeeReg.setDepartmentId(departmentId);

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(employeeReg)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> regResponse = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> regData = (Map<?, ?>) regResponse.get("data");
        Number empIdNum = (Number) regData.get("employeeId");
        Long employeeId = empIdNum.longValue();
        assertNotNull(employeeId);

        // 4. Login as user
        LoginRequestDto empLogin = new LoginRequestDto();
        empLogin.setEmail(empEmail);
        empLogin.setPassword("jane123");

        MvcResult empLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(empLogin)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> empLoginResponse = objectMapper.readValue(empLoginResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> empData = (Map<?, ?>) empLoginResponse.get("data");
        String employeeToken = (String) empData.get("accessToken");
        assertNotNull(employeeToken);

        // 5. Create unique travel category
        ExpenseCategoryRequestDto categoryRequest = new ExpenseCategoryRequestDto();
        categoryRequest.setCategoryName(catName);
        categoryRequest.setMaxLimit(BigDecimal.valueOf(1000.00));
        categoryRequest.setDescription("Category for official travel claims");

        MvcResult catResult = mockMvc.perform(post("/api/categories")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> catResponse = objectMapper.readValue(catResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> catData = (Map<?, ?>) catResponse.get("data");
        Number catIdNum = (Number) catData.get("categoryId");
        Long categoryId = catIdNum.longValue();
        assertNotNull(categoryId);

        // 6. Create HR budget
        LocalDate today = LocalDate.now();
        DepartmentBudgetRequestDto budgetRequest = new DepartmentBudgetRequestDto();
        budgetRequest.setDepartmentId(departmentId);
        budgetRequest.setMonth(today.getMonthValue());
        budgetRequest.setYear(today.getYear());
        budgetRequest.setMonthlyBudget(BigDecimal.valueOf(2000.00));

        mockMvc.perform(post("/api/budgets")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(budgetRequest)))
                .andExpect(status().isCreated());

        // 7. Submit claim
        ExpenseClaimRequestDto claimRequest = new ExpenseClaimRequestDto();
        claimRequest.setEmployeeId(employeeId);
        claimRequest.setCategoryId(categoryId);
        claimRequest.setAmount(BigDecimal.valueOf(400.00));
        claimRequest.setExpenseDate(today);
        claimRequest.setDescription("Flight booking to corporate event");

        MvcResult claimResult = mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + employeeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(claimRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> claimResponse = objectMapper.readValue(claimResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> claimData = (Map<?, ?>) claimResponse.get("data");
        Number claimIdNum = (Number) claimData.get("claimId");
        Long claimId = claimIdNum.longValue();
        assertNotNull(claimId);

        // 8. Approve claim
        ReviewClaimRequestDto reviewRequest = new ReviewClaimRequestDto();
        reviewRequest.setReviewerName("Finance Manager");
        reviewRequest.setStatus(ClaimStatus.APPROVED);
        reviewRequest.setRemarks("Approved");

        mockMvc.perform(post("/api/reviews/claims/" + claimId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isOk());

        // 9. Verify monthly summary
        MvcResult summaryResult = mockMvc.perform(get("/api/budgets/departments/" + departmentId + "/summary")
                .header("Authorization", "Bearer " + adminToken)
                .param("month", String.valueOf(today.getMonthValue()))
                .param("year", String.valueOf(today.getYear())))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> summaryResponse = objectMapper.readValue(summaryResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> summaryData = (Map<?, ?>) summaryResponse.get("data");
        assertEquals(2000.0, summaryData.get("totalBudget"));
        assertEquals(400.0, summaryData.get("totalApprovedClaims"));
        assertEquals(1600.0, summaryData.get("remainingBudget"));
        assertEquals(1, summaryData.get("approvedClaimsCount"));

        // 10. Submit claim that violates category limit (Should Fail)
        ExpenseClaimRequestDto excessiveCatClaim = new ExpenseClaimRequestDto();
        excessiveCatClaim.setEmployeeId(employeeId);
        excessiveCatClaim.setCategoryId(categoryId);
        excessiveCatClaim.setAmount(BigDecimal.valueOf(1500.00));
        excessiveCatClaim.setExpenseDate(today);
        excessiveCatClaim.setDescription("Too high");

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + employeeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(excessiveCatClaim)))
                .andExpect(status().isBadRequest());
    }
}
