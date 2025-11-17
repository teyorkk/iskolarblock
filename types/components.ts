import type {
  User,
  Application,
  ApplicationStatus,
  NavigationItem,
  StatsCard,
  ChartDataPoint,
  PieChartData,
  Feature,
  ApplicationStep,
} from "./index";
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import type {
  ApplicationFormData,
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Landing page component props
export interface LandingNavigationProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export type LandingHeroProps = Record<string, never>;

export interface LandingFeaturesProps {
  features: Feature[];
}

export type LandingAboutProps = Record<string, never>;

export type LandingFooterProps = Record<string, never>;

// Sidebar component props
export type SidebarProps = Record<string, never>;

export type AdminSidebarProps = SidebarProps;

export type UserSidebarProps = SidebarProps;

export interface SidebarNavigationProps {
  navigation: NavigationItem[];
  pathname: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export interface SidebarProfileProps {
  user: SupabaseUser | null;
  isCollapsed?: boolean;
}

export interface SidebarHeaderProps {
  isCollapsed?: boolean;
}

// Application form component props
export type ApplicationFormProps = Record<string, never>;

export interface ApplicationProgressProps {
  currentStep: number;
  steps: ApplicationStep[];
}

export interface ApplicationStepProps<
  T extends
    | ApplicationFormData
    | NewApplicationFormData
    | RenewalApplicationFormData =
    | ApplicationFormData
    | NewApplicationFormData
    | RenewalApplicationFormData
> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
}

export interface FileUploadZoneProps {
  uploadedFile: File | null;
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  error?: string;
  label?: string;
  onRemove?: () => void;
}

export interface ApplicationSuccessProps {
  applicationId?: string;
}

// User management component props
export type UserManagementProps = Record<string, never>;

export interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
}

export interface UserCardProps {
  user: User;
  onViewProfile: (user: User) => void;
  onDelete: (user: User) => void;
}

export interface UserListProps {
  users: User[];
  onViewProfile: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading: boolean;
}

export interface UserProfileDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  isLoadingApplications: boolean;
  onDelete: (user: User) => void;
  onSendPasswordReset: (user: User) => void;
  isSendingOTP: boolean;
}

export interface UserApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
}

export interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export interface StatusBadgeProps {
  status: ApplicationStatus | string;
}

// Dashboard component props
export type DashboardProps = Record<string, never>;

export type AdminDashboardProps = DashboardProps;

export type UserDashboardProps = DashboardProps;

export interface DashboardHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export interface StatsGridProps {
  stats: StatsCard[];
}

export interface LineChartProps {
  data: ChartDataPoint[];
  color?: string;
  title?: React.ReactNode;
  description?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: React.ReactNode;
  description?: string;
}

export interface RecentApplicantsProps {
  applicants: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    status: string;
    submittedDate: string;
  }>;
}

export interface RecentApplicationsProps {
  applications: Array<{
    type: string;
    date: string;
    status: string;
  }>;
}

export interface QuickActionsProps {
  actions: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
  }>;
}

export interface ApplicationPeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void;
  isLoading: boolean;
}
