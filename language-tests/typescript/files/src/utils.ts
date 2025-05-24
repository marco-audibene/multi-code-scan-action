// Violation: console.log usage
export function debugLog(message: string): void {
  console.log(`[DEBUG] ${message}`)
}

// Violation: eval usage
export function executeCode(code: string): any {
  return eval(code)
}

// Violation: setTimeout without proper typing
export function delayedAction(callback: any, delay: number): void {
  setTimeout(callback, delay)
}

// Violation: prefer readonly
export const API_ENDPOINTS = {
  users: "/api/users",
  posts: "/api/posts",
}

// Violation: no explicit return type
export function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

// Violation: any in generic
export function createArray<T = any>(length: number): T[] {
  return new Array(length)
}
