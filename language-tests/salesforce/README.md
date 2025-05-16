# Salesforce Tests

This directory contains test files and rulesets for Salesforce technologies.

## Structure

\`\`\`
salesforce/
├── files/
│   ├── classes/
│   │   └── [Apex classes with intentional violations]
│   ├── lwc/
│   │   └── [LWC components with intentional violations]
│   └── aura/
│       └── [Aura components with intentional violations]
└── rulesets/
    ├── pmd/
    │   ├── apex/
    │   │   └── [PMD rulesets for Apex]
    │   └── xml/
    │       └── [PMD rulesets for XML]
    └── eslint/
        ├── lwc/
        │   └── [ESLint configs for LWC]
        └── aura/
            └── [ESLint configs for Aura]
\`\`\`

## Test Files

The test files contain intentional code quality issues that should be detected by the action.

## Rulesets

The rulesets are configured to detect common code quality issues in Salesforce code.
\`\`\`

```apex file="language-tests/salesforce/files/classes/TestController.cls"
public with sharing class TestController {
    // Violation: Unused variable
    private String unusedVar;
    
    // Violation: Method too long
    public static List<Account> getAccounts() {
        // Violation: SOQL in loop
        List<Account> accounts = new List<Account>();
        for (Contact c : [SELECT Id FROM Contact LIMIT 10]) {
            List<Account> relatedAccounts = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId];
            accounts.addAll(relatedAccounts);
        }
        return accounts;
    }
}
