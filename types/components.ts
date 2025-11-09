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
import type { ApplicationFormData } from "@/lib/validations";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Landing page component props
export interface LandingNavigationProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export interface LandingHeroProps {
  // No props needed currently
}

export interface LandingFeaturesProps {
  features: Feature[];
}

export interface LandingAboutProps {
  // No props needed currently
}

export interface LandingFooterProps {
  // No props needed currently
}

// Sidebar component props
export interface SidebarProps {
  // Common props for both admin and user sidebars
}

export interface AdminSidebarProps extends SidebarProps {
  // Admin-specific props
}

export interface UserSidebarProps extends SidebarProps {
  // User-specific props
}

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
export interface ApplicationFormProps {
  // Main form props
}

export interface ApplicationProgressProps {
  currentStep: number;
  steps: ApplicationStep[];
}

export interface ApplicationStepProps {
  register: UseFormRegister<ApplicationFormData>;
  errors: FieldErrors<ApplicationFormData>;
  setValue: UseFormSetValue<ApplicationFormData>;
  watch: UseFormWatch<ApplicationFormData>;
}

export interface FileUploadZoneProps {
  uploadedFile: File | null;
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  error?: string;
  label?: string;
}

export interface ApplicationSuccessProps {
  applicationId?: string;
}

// User management component props
export interface UserManagementProps {
  // Main component props
}

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
export interface DashboardProps {
  // Common dashboard props
}

export interface AdminDashboardProps extends DashboardProps {
  // Admin-specific props
}

export interface UserDashboardProps extends DashboardProps {
  // User-specific props
}

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
    name: string;
    email: string;
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
