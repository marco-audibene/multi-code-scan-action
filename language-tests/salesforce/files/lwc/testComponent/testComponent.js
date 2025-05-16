import { LightningElement, api } from "lwc"

export default class TestComponent extends LightningElement {
  @api recordId

  // Violation: console.log
  connectedCallback() {
    console.log("Component initialized")

    // Violation: eval
    eval("1 + 1")
  }

  // Violation: unused method
  unusedMethod() {
    return true
  }
}
