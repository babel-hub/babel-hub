import { Component } from 'react';

import type { ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
        this.setState({ errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-800 text-center mt-10">
                    <h2 className="text-2xl font-bold mb-2">¡Ups! Algo salió mal en esta sección.</h2>
                    <p className="mb-4 text-red-error">Por favor, intenta recargar la página o vuelve más tarde.</p>

                    <details className="text-left bg-white px-5 py-3 rounded text-xs overflow-auto max-h-40">
                        <summary className="font-bold cursor-pointer">Detalles</summary>
                        <br />
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;