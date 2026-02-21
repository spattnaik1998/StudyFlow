export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  active?: boolean;
}

export interface TaskViewType {
  id: "list" | "board" | "timeline" | "calendar";
  label: string;
  icon: string;
}

export interface FilterOptions {
  status?: string[];
  priority?: string[];
  project?: string[];
  tags?: string[];
  due_date_range?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: "due_date" | "priority" | "created_at" | "updated_at";
  direction: "asc" | "desc";
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface DialogConfig {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}
