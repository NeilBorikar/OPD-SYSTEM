import "../styles/global.css";

const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 border-2 border-blue-300 rounded-full border-b-transparent animate-spin animation-delay-150"></div>
        <div className="absolute inset-4 border-2 border-blue-400 rounded-full border-l-transparent animate-spin animation-delay-300"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
