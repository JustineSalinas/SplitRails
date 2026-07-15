import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Without this, an uncaught exception anywhere in the tree (a bad RPC response, a null
// dereference on a page that assumed live data would always resolve, etc.) white-screens
// the whole app with no way back except a manual reload of the address bar.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in SplitRails UI:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-6">
          <div className="max-w-[440px] text-center">
            <div className="w-14 h-14 rounded-full bg-action/[0.12] flex items-center justify-center mx-auto mb-5">
              <span className="msym text-[28px] text-action">error</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-5 leading-[1.5]">
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null })
                window.location.href = '/'
              }}
              className="bg-gradient-brand text-white border-none py-2.5 px-5 rounded-full text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)]"
            >
              Back to Splits
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
