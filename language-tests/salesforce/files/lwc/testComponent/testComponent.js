import { LightningElement, api } from "lwc"

export default class TestComponent extends LightningElement {
  @api recordId

  // Violation: console.log 
  connectedCallback() {
    console.log("Component initialized.")

    // Violation: eval
    eval("1 + 1")

    // Violation: setTimeout (async operation)
    setTimeout(() => {
      this.doSomething()
    }, 1000)
  }

  // Violation: unused method
  unusedMethod() {
    return true
  }

  doSomething() {
    // Just a method to be called by setTimeout
    const element = this.template.querySelector("div")
    if (element) {
      element.classList.add("active")
    }
  }
}
