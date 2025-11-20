'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught an error:', error, errorInfo)
        // TODO: Log to error reporting service (e.g., Sentry)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#0d1117] border border-gray-700 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-400 mb-6">
                            We're sorry, but something unexpected happened. Please try again.
                        </p>
                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-left">
                                <p className="text-sm text-red-300 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="bg-[#21262d] text-gray-300 border-gray-700 hover:bg-gray-700"
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="bg-[#58a6ff] hover:bg-[#58a6ff]/90 text-white"
                            >
                                Go to Home
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
