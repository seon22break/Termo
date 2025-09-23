interface NotFoundTabProps {
  title?: string;
  subtitle?: string;
  onGoBack?: () => void;
}

const NotFoundTab = (
    { 
        title = "Página no encontrada",
        subtitle = "La página que buscas no existe o ha sido movida."
    }: NotFoundTabProps
) => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-white">
      <div className="text-center max-w-md mx-auto px-8">

        <div className="mb-8">
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 text-sm text-zinc-600 space-y-2">
          <p>💡 Revisa la URL o usa la navegación del sidebar</p>
          <p>🔄 También puedes intentar recargar la página</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundTab;
