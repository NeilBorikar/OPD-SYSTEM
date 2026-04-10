import "../styles/global.css";

const ErrorMessage = ({ message, onDismiss, type = "error" }) => {
  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconStyles = {
    error: "❌",
    success: "✅", 
    warning: "⚠️",
    info: "ℹ️"
  };

  return (
    <div className={`${typeStyles[type]} border rounded-lg p-4 mb-4 flex items-center justify-between animate-pulse`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{iconStyles[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
