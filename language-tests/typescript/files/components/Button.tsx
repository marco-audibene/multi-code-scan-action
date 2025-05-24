"use client"

import type React from "react"

// Violation: any in props interface
interface ButtonProps {
  onClick: any
  children: React.ReactNode
  disabled?: boolean
  variant?: string
}

// Violation: no explicit return type
export function Button({ onClick, children, disabled, variant }: ButtonProps) {
  // Violation: console.log in component
  console.log("Button rendered with variant:", variant)

  // Violation: unused variable
  const unusedStyle = { color: "red" }

  // Violation: any type assertion
  const handleClick = (event: any) => {
    onClick(event)
  }

  return (
    <button onClick={handleClick} disabled={disabled} className={`btn btn-${variant || "primary"}`}>
      {children}
    </button>
  )
}

// Violation: unused component
function UnusedComponent(): JSX.Element {
  return <div>I'm never used</div>
}

export default Button
