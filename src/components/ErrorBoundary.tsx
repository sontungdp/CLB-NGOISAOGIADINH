import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { StorageService } from '../utils/storage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleResetData = () => {
    if (window.confirm('Khôi phục lại dữ liệu mẫu gốc ban đầu để sửa lỗi?')) {
      try {
        StorageService.resetToInitialData();
        localStorage.removeItem('nsgd_theme');
      } catch (e) {
        console.error(e);
      }
      this.setState({ hasError: false, error: null });
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-xs text-slate-600">
                Ứng dụng gặp lỗi giao diện. Bạn có thể bấm nút bên dưới để tải lại hoặc khôi phục dữ liệu gốc.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl font-mono text-left max-h-32 overflow-y-auto border border-red-200">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Tải Lại Ứng Dụng
              </button>
              
              <button
                type="button"
                onClick={this.handleResetData}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Reset Dữ Liệu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
