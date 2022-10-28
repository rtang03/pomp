import toast from 'react-hot-toast';
import { STATUS } from 'src/constants';

export const onFormSubmitError = (
  setSubmitting: (isSubmitting: boolean) => void,
  setStatus: (status: any) => void,
  toastError?: string
) => {
  setStatus(STATUS.ERR);
  setSubmitting(false);
  toastError && toast.error(toastError);
};
