package com.example;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Test class with violations
 */
public class UserServiceTest {
    
    // Violation: test method without assertion
    @Test
    public void testGetUsers() {
        UserService service = new UserService();
        // Missing assertions
    }
    
    // Violation: test method that always passes
    @Test
    public void testCreateUser() {
        assertTrue(true);
    }
    
    // Violation: unused test method
    public void unusedTestMethod() {
        // This method is not annotated with @Test
    }
    
    // Violation: test method with too many assertions
    @Test
    public void testUserCreation() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setActive(true);
        
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
        assertTrue(user.isActive());
        assertNotNull(user);
        assertNotNull(user.getName());
        assertNotNull(user.getEmail());
        assertTrue(user.getName().length() > 0);
        assertTrue(user.getEmail().contains("@"));
        // ... too many assertions in one test
    }
}
