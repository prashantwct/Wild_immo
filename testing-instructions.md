# Setting Up Testing for Wildlife Immobilization App

This document provides instructions for installing and running the automated tests once your Node.js environment is properly set up.

## Prerequisites

Ensure you have Node.js and npm installed. You can check by running:
```
node --version
npm --version
```

## Installation

Install the required testing dependencies by running:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

## Running Tests

Once the dependencies are installed, you can run tests using the following npm scripts:

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (automatically re-run when files change)

## Test Structure

Tests are located in the `src/__tests__` directory and follow the naming convention `*.test.tsx` for React component tests.

## Writing Tests

Here are some tips for writing good tests:

1. **Test Component Rendering**: Verify that components render correctly with the expected UI elements.
2. **Test User Interactions**: Simulate clicks, input changes, etc. using `userEvent` and ensure the component responds correctly.
3. **Test Calculations**: Verify that business logic and calculations produce the expected results.
4. **Test Error States**: Ensure error messages appear when expected.

## Example

```typescript
// Example test for a calculator component
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorComponent from '../components/Calculator'

test('calculates dosage correctly', async () => {
  render(<CalculatorComponent />)
  
  // Input values
  await userEvent.type(screen.getByLabelText(/weight/i), '100')
  await userEvent.selectOptions(screen.getByLabelText(/species/i), 'Lion')
  
  // Submit form
  await userEvent.click(screen.getByRole('button', { name: /calculate/i }))
  
  // Verify results
  expect(screen.getByText(/ketamine: 200 mg/i)).toBeInTheDocument()
})
```

## Mocking

When testing components that use localStorage, API calls, or other external dependencies, you should mock those dependencies. The test file already includes a mock implementation for localStorage.
