'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({
  message = 'Analyzing your website...',
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-center animate-pulse">{message}</p>
      )}
      <div className="mt-6 max-w-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Checking SEO elements...</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          <span>Analyzing performance metrics...</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span>Scanning security headers...</span>
        </div>
      </div>
    </div>
  );
}
