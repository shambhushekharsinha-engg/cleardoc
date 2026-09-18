import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-rose-100 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-500">
              An unexpected error occurred while rendering this section.
            </p>
            {this.state.error?.message && (
              <p className="text-xs font-mono bg-rose-50/50 p-2.5 rounded-xl text-rose-800 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
