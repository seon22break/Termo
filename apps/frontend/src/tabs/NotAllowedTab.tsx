interface NotAllowedTabProps {
  title?: string;
  subtitle?: string;
  message?: string;
  onGoBack?: () => void;
}

const NotAllowedTab = ({ 
  title = "Acceso Denegado",
  subtitle = "No tienes permisos para acceder a esta página",
  message = "Por favor, contacta con el administrador si crees que esto es un error.",
  onGoBack
}: NotAllowedTabProps) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-zinc-900">
      <div className="flex flex-col items-center text-center max-w-md p-8">
        {/* Icon */}
        <div className="relative w-24 h-24 mb-8 flex-shrink-0">
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🚫</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-red-500 tracking-wide">
            {title}
          </h1>
          <h2 className="text-xl text-zinc-400 font-medium">
            {subtitle}
          </h2>
          {message && (
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              {message}
            </p>
          )}
        </div>

        {/* Action */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            Volver
          </button>
        )}

        {/* Tips */}
        <div className="mt-8 text-xs text-zinc-600 space-y-1">
          <p>🔒 Verifica que tengas los permisos necesarios</p>
          <p>👤 Contacta al administrador si persiste el problema</p>
        </div>
      </div>
    </div>
  );
};

export default NotAllowedTab;
