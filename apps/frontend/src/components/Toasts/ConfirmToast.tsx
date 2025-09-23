import React from 'react';

interface ConfirmToastProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

const ConfirmToast: React.FC<ConfirmToastProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-100 justify-items-center items-center">
      <div
        role="alert"
        className="rounded-md border border-gray-300 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <div className="flex items-start gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`size-6 ${isDestructive ? 'text-red-600' : 'text-green-600'}`}
          >
            {isDestructive ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>

          <div className="flex-1">
            <strong className="font-medium text-gray-900 dark:text-white">
              {title}
            </strong>

            <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">
              {message}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`rounded border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ${
                  loading 
                    ? 'border-gray-400 text-gray-500 cursor-not-allowed' 
                    : isDestructive
                      ? 'border-red-300 text-red-900 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'
                }`}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {confirmText}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={`rounded border border-transparent px-3 py-1.5 text-sm font-medium transition-colors ${
                  loading 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                }`}
              >
                {cancelText}
              </button>
            </div>
          </div>

          <button
            className="-m-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            type="button"
            onClick={onCancel}
            aria-label="Dismiss alert"
          >
            <span className="sr-only">Dismiss popup</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
