import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const applicationSchema = z.object({
  type: z.enum(['new', 'renewal']),
  idDocument: z.instanceof(File, { message: 'ID document is required' }),
  fullName: z.string().min(2, 'Full name is required'),
  age: z.string().min(1, 'Age is required'),
  address: z.string().min(5, 'Address is required'),
  school: z.string().min(2, 'School is required'),
  course: z.string().min(2, 'Course is required'),
  yearLevel: z.string().min(1, 'Year level is required'),
  gwa: z.string().min(1, 'GWA is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
