import { createContext, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState({ isOpen: false, message: '', title: '', resolve: null });

  const confirm = ({ title = "Are you sure?", message }) => {
    return new Promise((resolve) => {
      setDialog({ isOpen: true, title, message, resolve });
    });
  };

  const handleClose = (result) => {
    if (dialog.resolve) dialog.resolve(result);
    setDialog({ ...dialog, isOpen: false, resolve: null });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dialog.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{dialog.message}</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleClose(true)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);