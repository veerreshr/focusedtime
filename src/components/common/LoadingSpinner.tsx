export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };
    return (
        <div className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size]}`} role="status" aria-label="Loading...">
            <span className="sr-only">Loading...</span>
        </div>
    );
};