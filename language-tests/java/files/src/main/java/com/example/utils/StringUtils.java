package com.example.utils;

import java.util.*;

/**
 * String utility class with violations
 */
public class StringUtils {
    
    // Violation: utility class should have private constructor
    
    // Violation: method too complex
    public static String processString(String input) {
        if (input == null) {
            return null;
        }
        
        String result = input;
        
        // Violation: deeply nested if statements
        if (result.length() > 0) {
            if (result.contains(" ")) {
                if (result.startsWith(" ")) {
                    result = result.trim();
                    if (result.length() > 10) {
                        if (result.contains("@")) {
                            result = result.toLowerCase();
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    // Violation: unused method
    private static void unusedMethod() {
        System.out.println("This method is never called");
    }
    
    // Violation: method with side effects (should be pure)
    public static String formatAndLog(String input) {
        String formatted = input.toUpperCase();
        // Violation: logging in utility method
        System.out.println("Formatted: " + formatted);
        return formatted;
    }
    
    // Violation: inefficient string concatenation in loop
    public static String joinStrings(List<String> strings) {
        String result = "";
        for (String str : strings) {
            result += str + ",";
        }
        return result;
    }
}
