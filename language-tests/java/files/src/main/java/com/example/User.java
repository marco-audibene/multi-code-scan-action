package com.example;

import java.util.Date;

/**
 * User entity with code quality violations
 */
public class User {
    
    // Violation: public fields instead of private with getters/setters
    public Long id;
    public String name;
    public String email;
    public boolean active;
    public Date createdDate;
    
    // Violation: unused field
    private String internalField;
    
    // Violation: constructor with too many parameters
    public User(Long id, String name, String email, boolean active, Date createdDate, String department, String manager, String phone, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.active = active;
        this.createdDate = createdDate;
    }
    
    // Default constructor
    public User() {
    }
    
    // Violation: getter/setter methods for public fields (redundant)
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public Date getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
    
    // Violation: equals method without hashCode
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return id != null ? id.equals(user.id) : user.id == null;
    }
    
    // Missing hashCode method
}
