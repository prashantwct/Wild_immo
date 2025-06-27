"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps extends React.PropsWithChildren {
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              window.location.reload()
            }}
            className="mt-4"
          >
            Reload Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  ErrorFallback?: React.ComponentType<{ error: Error | null }>
) {
  return function ErrorBoundaryWrapper(props: T) {
    return (
      <ErrorBoundary
        fallback={
          ErrorFallback ? (
            <ErrorFallback error={null} />
          ) : (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-muted-foreground">
                  An unexpected error occurred. Please try again.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload()
                }}
                className="mt-4"
              >
                Reload Page
              </Button>
            </div>
          )
        }
      >
        <Component {...(props as any)} />
      </ErrorBoundary>
    )
  }
}
