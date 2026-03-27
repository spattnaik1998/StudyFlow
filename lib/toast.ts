import { toast } from "sonner";

export function showSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: Infinity,
  });
}

export function showLoading(message: string): string | number {
  return toast.loading(message);
}

export function dismissToast(id: string | number) {
  toast.dismiss(id);
}
