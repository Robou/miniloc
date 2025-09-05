import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';

const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<{ message: string }, boolean>) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      show ? 'bg-opacity-30 visible bg-blue-50 opacity-100' : 'invisible opacity-0'
    }`}
  >
    <div
      className={`card transform transition-all duration-300 ${
        show ? 'bounce-in scale-100' : 'scale-95'
      } mx-4 w-full max-w-md`}
    >
      <div className="card-header">
        <h3 className="mb-0 text-lg font-semibold">Confirmation</h3>
      </div>
      <div className="card-body">
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => proceed(false)}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => proceed(true)}
            className="btn-primary rounded-md border border-transparent px-4 py-2 font-medium transition-all duration-200"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const confirmation = createConfirmation(confirmable(MyDialog));
