import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Surfaced to the console for debugging; UI shows a recoverable message.
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-paper flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="font-display text-3xl text-maroon">Something went wrong</h1>
          <p className="max-w-md text-maroon/70">{this.state.error.message}</p>
          <button className="btn-primary" onClick={() => location.assign("/")}>
            Return to dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
