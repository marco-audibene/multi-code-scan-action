# Java Tests

This directory contains test files and rulesets for Java development.

## Structure

<pre><code>java/
├── files/
│   ├── src/
│   │   ├── main/java/com/example/
│   │   │   ├── UserService.java
│   │   │   ├── User.java
│   │   │   └── utils/
│   │   │       └── StringUtils.java
│   │   └── test/java/com/example/
│   │       └── UserServiceTest.java
└── rulesets/
    └── pmd/
        └── standard-ruleset.xml
</code></pre>

## Test Files

The test files contain intentional code quality issues that should be detected by the action:

### Main Classes
- `UserService.java`: Contains method complexity, SQL injection risks, resource leaks, and poor exception handling
- `User.java`: Contains public fields, missing hashCode, constructor with too many parameters
- `StringUtils.java`: Contains utility class violations, complex nested logic, and inefficient string operations

### Test Classes
- `UserServiceTest.java`: Contains test method violations, missing assertions, and test quality issues

## Violations Included

### Security Issues
- Hardcoded database credentials
- SQL injection vulnerabilities
- Resource leaks

### Design Issues
- Methods with too many parameters
- Complex conditional logic
- Missing documentation
- Utility classes without private constructors

### Code Style Issues
- Public fields instead of private with getters/setters
- Poor naming conventions
- System.out.println in production code

### Best Practices
- Empty catch blocks
- Missing hashCode when equals is overridden
- Unused variables and methods
- Inefficient string concatenation

### Performance Issues
- String concatenation in loops
- Resource management problems

## Rulesets

### PMD Rulesets
- `standard-ruleset.xml`: Comprehensive Java rules covering security, performance, design, and best practices

The ruleset includes rules from all major PMD categories:
- **Best Practices**: JUnit best practices, exception handling, etc.
- **Code Style**: Naming conventions, formatting, etc.
- **Design**: Complexity metrics, class design, etc.
- **Error Prone**: Common programming mistakes
- **Performance**: Performance anti-patterns
- **Security**: Security vulnerabilities
- **Documentation**: Documentation requirements

## Running Tests

These tests are run using the `java-code-quality-test.yml` workflow, which executes the multi-code-scan-action against these test files using the provided rulesets.

The action should detect the intentional violations in each file type and report them as annotations in GitHub.

## Expected Violations

When run against these test files, the action should detect violations including:
- **Security**: SQL injection, hardcoded credentials
- **Design**: Complex methods, too many parameters
- **Performance**: Inefficient string operations
- **Best Practices**: Resource leaks, empty catch blocks
- **Code Style**: Public fields, naming conventions
- **Error Prone**: Missing hashCode, unused variables
