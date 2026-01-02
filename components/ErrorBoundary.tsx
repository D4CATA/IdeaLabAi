
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  /**
   * Children are optional to satisfy React 18+ expectations.
   */
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component to catch and handle rendering errors gracefully.
 */
// Fix: Extending Component directly with generic Props and State ensures that the 'props' property is correctly inherited and recognized by the TypeScript compiler.
class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly define the state property to satisfy the Component class requirements.
  public state: State = {
    hasError: false
  };

  // Fix: Adding a constructor that calls super(props) ensures that 'this.props' is correctly initialized in the instance.
  constructor(props: Props) {
    super(props);
  }

  // Fix: Static method to update state after an error occurs in a child component.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Fix: Lifecycle method to perform side-effects like logging after an error is caught.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // Fix: Standard render method for class-based components.
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Engine Failure Detected</h1>
          <p className="text-slate-500 max-w-md mb-8 font-medium">
            The Access Engine encountered a critical exception. Logic patterns have been preserved.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Reboot Engine
          </button>
        </div>
      );
    }

    // Fix: Correctly access children from 'this.props', which is now properly recognized through inheritance.
    return this.props.children || null;
  }
}

export default ErrorBoundary;
