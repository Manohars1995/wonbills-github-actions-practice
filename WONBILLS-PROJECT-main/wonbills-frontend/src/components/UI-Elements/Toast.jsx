import { toast } from "sonner";

function toastPromise(promise, messages) {
  return toast.promise(promise, messages);
}

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
  loading: (message) => toast.loading(message),
  custom: (content) => toast(content),
  promise: toastPromise,
};
