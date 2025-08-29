import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<{ message: string }, boolean>) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      show ? 'opacity-100 visible bg-blue-50 bg-opacity-30' : 'opacity-0 invisible'
    }`}
  >
    <div
      className={`card transform transition-all duration-300 ${
        show ? 'scale-100 bounce-in' : 'scale-95'
      } max-w-md w-full mx-4`}
    >
      <div className="card-header">
        <h3 className="text-lg font-semibold mb-0">Confirmation</h3>
      </div>
      <div className="card-body">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => proceed(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={() => proceed(true)}
            className="btn-primary px-4 py-2 border border-transparent rounded-md transition-all duration-200 font-medium"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const confirmation = createConfirmation(confirmable(MyDialog));
