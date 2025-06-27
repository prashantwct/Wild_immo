import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorPage from '../app/calculator/page'

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {}
  return {
    getItem: function(key: string) {
      return store[key] || null
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Disable console errors during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('CalculatorPage', () => {
  it('renders calculator form', () => {
    render(<CalculatorPage />)
    
    // Check if important form elements are present
    expect(screen.getByText(/wildlife immobilization calculator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument()
  })

  it('updates weight when input changes', async () => {
    render(<CalculatorPage />)
    
    // Find weight input and change its value
    const weightInput = screen.getByLabelText(/weight/i)
    await userEvent.clear(weightInput)
    await userEvent.type(weightInput, '100')
    
    expect(weightInput).toHaveValue('100')
  })

  it('calculates drugs when form is submitted', async () => {
    render(<CalculatorPage />)
    
    // Fill out the form
    const speciesSelect = screen.getByLabelText(/species/i)
    const weightInput = screen.getByLabelText(/weight/i)
    const calculateButton = screen.getByRole('button', { name: /calculate/i })
    
    // Select species and enter weight
    await userEvent.selectOptions(speciesSelect, 'Lion')
    await userEvent.clear(weightInput)
    await userEvent.type(weightInput, '150')
    
    // Submit form
    await userEvent.click(calculateButton)
    
    // Check that results are displayed
    expect(screen.getByTestId('drug-results')).toBeInTheDocument()
  })
})
