import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const applicationSchema = z.object({
  type: z.enum(["new", "renewal"]),
  idDocument: z.instanceof(File, { message: "ID document is required" }),
  fullName: z.string().min(2, "Full name is required"),
  age: z.string().min(1, "Age is required"),
  address: z.string().min(5, "Address is required"),
  school: z.string().min(2, "School is required"),
  course: z.string().min(2, "Course is required"),
  yearLevel: z.string().min(1, "Year level is required"),
  gwa: z.string().min(1, "GWA is required"),
  certificateOfGrades: z.instanceof(File, {
    message: "Certificate of grades is required",
  }),
  certificateOfRegistration: z.instanceof(File, {
    message: "Certificate of registration is required",
  }),
});

export const newApplicationSchema = z.object({
  // Files are managed separately in state, not in form data
  lastName: z.string().min(2, "Last name is required"),
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional().nullable(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(2, "Place of birth is required"),
  age: z.string().min(1, "Age is required"),
  sex: z.enum(["male", "female"]),
  houseNumber: z.string().min(1, "House number is required"),
  purok: z.string().min(1, "Purok is required"),
  barangay: z.string().min(1, "Barangay is required"),
  municipality: z.string().min(1, "Municipality is required"),
  province: z.string().min(1, "Province is required"),
  citizenship: z.string().min(1, "Citizenship is required"),
  contactNumber: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) =>
        val.toLowerCase() === "n/a" ||
        (/^\d{11}$/.test(val) && val.startsWith("09")),
      "Please enter a valid contact number or just leave it N/A"
    ),
  religion: z.string().min(2, "Religion is required"),
  course: z.string().min(2, "Course/Strand is required"),
  yearLevel: z.enum(["G11", "G12", "1", "2", "3", "4"]),
});

export const renewalApplicationSchema = z.object({
  // Files are managed in state, not in form
  // No personal info fields needed - they come from previous application
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type NewApplicationFormData = z.infer<typeof newApplicationSchema>;
export type RenewalApplicationFormData = z.infer<
  typeof renewalApplicationSchema
>;
