"use client"

import type React from "react"
import { useState } from "react"

// Violation: any in interface
interface FormData {
  name: string
  email: string
  metadata: any
}

// Violation: no explicit return type
export function ContactForm() {
  // Violation: any in useState
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
  })

  // Violation: unused state
  const [unusedState, setUnusedState] = useState<string>("")

  // Violation: any parameter
  const handleInputChange = (event: any) => {
    const { name, value } = event.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Violation: floating promise
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    // Violation: console.log usage
    console.log("Submitting form:", formData)

    // Should be awaited
    fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(formData),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} />
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

export default ContactForm
