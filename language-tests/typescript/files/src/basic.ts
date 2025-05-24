// Violation: unused variable
const unusedVariable: string = "I'm not used anywhere"

// Violation: any type usage
function processData(data: any): any {
  // Violation: console.log usage
  console.log("Processing data:", data)

  // Violation: missing return type annotation
  return data.someProperty
}

// Violation: unused function
function unusedFunction() {
  return "This function is never called"
}

// Violation: no explicit return type
function calculateSum(a: number, b: number) {
  return a + b
}

// Violation: prefer const assertion
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} as const

// Violation: unused parameter
function greetUser(name: string, age: number): string {
  return `Hello, ${name}!`
}

// Violation: any in interface
interface User {
  id: number
  name: string
  metadata: any
}

export { processData, calculateSum }
