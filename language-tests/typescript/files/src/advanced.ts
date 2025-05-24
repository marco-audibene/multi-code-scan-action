// Violation: floating promise
async function fetchUserData(id: number) {
  fetch(`/api/users/${id}`) // Should be awaited

  // Violation: any type in async function
  const response: any = await fetch(`/api/users/${id}`)
  return response.json()
}

// Violation: unsafe member access
function getUserName(user: any): string {
  return user.profile.name.first // Unsafe chain
}

// Violation: prefer nullish coalescing
function getDisplayName(name?: string): string {
  return name || "Anonymous" // Should use ?? instead of ||
}

// Violation: no-misused-promises
const button = document.getElementById("submit")
if (button) {
  // Violation: async function in event handler without proper handling
  button.addEventListener("click", async () => {
    await fetchUserData(123)
  })
}

// Violation: ban-types
function processObject(obj: Object): void {
  console.log(obj)
}

// Violation: no-non-null-assertion
function getElementValue(): string {
  const element = document.getElementById("input")!
  return element.value
}

export { fetchUserData, getUserName, getDisplayName }
