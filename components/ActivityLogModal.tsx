
import React from 'react';
import { ActivityLog } from '../types';
import { X, PlusCircle, Pencil, Trash2, Move, ToggleLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

const actionIcons = {
  Create: <PlusCircle className="h-5 w-5 text-white" />,
  Update: <Pencil className="h-5 w-5 text-white" />,
  Delete: <Trash2 className="h-5 w-5 text-white" />,
  Reorder: <Move className="h-5 w-5 text-white" />,
  'Toggle Status': <ToggleLeft className="h-5 w-5 text-white" />,
};

const actionColors = {
  Create: 'bg-green-500',
  Update: 'bg-blue-500',
  Delete: 'bg-red-500',
  Reorder: 'bg-purple-500',
  'Toggle Status': 'bg-yellow-500',
};

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8 transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Activity Log</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <X size={24} />
          </button>
        </header>

        <main className="p-6 max-h-[70vh] overflow-y-auto">
          {logs.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {logs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== logs.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${actionColors[log.action]}`}>
                            {actionIcons[log.action]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{log.ruleName}</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {format(log.timestamp, 'MMM d, yyyy, h:mm:ss a')}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                            <p><strong>Action:</strong> {log.action}</p>
                            <p><strong>Details:</strong> {log.details}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No activities have been logged yet.</p>
            </div>
          )}
        </main>
        
        <footer className="flex justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ActivityLogModal;
