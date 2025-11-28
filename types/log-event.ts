export type LogEventType =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTER"
  | "USER_SETTINGS_UPDATE"
  | "USER_APPLICATION_SUBMITTED"
  | "USER_APPLICATION_UPDATED"
  | "ADMIN_APPLICATION_EDIT"
  | "ADMIN_APPLICATION_EDIT_COG"
  | "ADMIN_APPLICATION_EDIT_COR"
  | "ADMIN_REPORT_GENERATED"
  | "ADMIN_PERIOD_CREATED"
  | "ADMIN_AWARD_GRANTED"
  | "ADMIN_USER_DELETED"
  | "ADMIN_SETTINGS_UPDATE";

export interface LogEventRecord {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  actor_name: string | null;
  actor_username: string | null;
  actor_avatar_url: string | null;
  event_type: LogEventType;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}









