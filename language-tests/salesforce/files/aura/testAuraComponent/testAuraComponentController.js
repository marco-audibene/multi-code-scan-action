;({
    // Violation: console.log usage
    doInit: (component, event, helper) => {
      console.log("Component initialized")
  
      // Violation: eval usage
      eval("1 + 1")
  
      // Get the record ID
      var recordId = component.get("v.recordId")
  
      // Violation: alert usage
      if (!recordId) {
        alert("No record ID provided.")
      }
    },
  
    // Violation: unused method
    unusedMethod: (component, event, helper) => true,
  })
  