public with sharing class TestController {
    // Violation: Unused variable.
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
