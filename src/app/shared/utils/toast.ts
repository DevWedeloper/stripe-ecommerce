import { toast } from 'ngx-sonner';

export const showError = (message: string): void => {
  toast.error(message, {
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });
};

export const showSuccess = (message: string): void => {
  toast.success(message, {
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });
};
