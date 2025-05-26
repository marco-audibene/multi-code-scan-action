package com.example;

import java.util.*;
import java.sql.*;

/**
 * User service class with intentional code quality violations
 */
public class UserService {
    
    // Violation: unused field
    private String unusedField = "not used";
    
    // Violation: non-final static field
    public static String publicStaticField = "bad practice";
    
    // Violation: method too long, too complex
    public List<User> getUsers(String filter, boolean includeInactive, String sortBy, boolean ascending, int limit, int offset) throws Exception {
        List<User> users = new ArrayList<User>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            // Violation: hardcoded connection string
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb", "root", "password");
            
            String sql = "SELECT * FROM users WHERE 1=1";
            
            // Violation: string concatenation in SQL (potential SQL injection)
            if (filter != null && !filter.isEmpty()) {
                sql += " AND name LIKE '%" + filter + "%'";
            }
            
            if (!includeInactive) {
                sql += " AND active = 1";
            }
            
            // Violation: complex conditional logic
            if (sortBy != null && (sortBy.equals("name") || sortBy.equals("email") || sortBy.equals("created_date"))) {
                sql += " ORDER BY " + sortBy;
                if (!ascending) {
                    sql += " DESC";
                }
            } else {
                sql += " ORDER BY id";
            }
            
            sql += " LIMIT " + limit + " OFFSET " + offset;
            
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            
            while (rs.next()) {
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setActive(rs.getBoolean("active"));
                user.setCreatedDate(rs.getTimestamp("created_date"));
                users.add(user);
            }
            
            // Violation: empty catch block
        } catch (SQLException e) {
            // Should log or handle properly
        } finally {
            // Violation: resource leak potential
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                // Ignore
            }
        }
        
        return users;
    }
    
    // Violation: method with too many parameters
    public User createUser(String firstName, String lastName, String email, String phone, String address, String city, String state, String zipCode, boolean isActive, String department) {
        // Violation: unused local variable
        String unusedVar = "not used";
        
        User user = new User();
        user.setName(firstName + " " + lastName);
        user.setEmail(email);
        user.setActive(isActive);
        
        // Violation: System.out.println in production code
        System.out.println("Creating user: " + user.getName());
        
        return user;
    }
    
    // Violation: missing documentation
    public void deleteUser(Long id) {
        // Violation: empty method body
    }
    
    // Violation: method name doesn't follow conventions
    public boolean CheckUserExists(String email) {
        // Violation: always returns true
        return true;
    }
}
