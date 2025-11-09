"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, ArrowLeft, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OTPVerification } from "@/components/ui/otp-verification";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
// Auth state now handled by SessionProvider; local store removed
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [pendingUserData, setPendingUserData] =
    useState<RegisterFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  // SessionProvider will pick up auth changes; no manual login state needed

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const getErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();
    // Check for various "email is taken" error patterns
    if (
      lowerError.includes("email is taken") ||
      lowerError.includes("already registered") ||
      lowerError.includes("already exists") ||
      lowerError.includes("user already registered") ||
      lowerError.includes("user with this email") ||
      lowerError.includes("email address already") ||
      lowerError.includes("email already")
    ) {
      return "Email is taken. Please use a different email address.";
    }
    if (lowerError.includes("email") && !lowerError.includes("taken") && !lowerError.includes("already")) {
      return "Invalid email address. Please check and try again.";
    }
    if (lowerError.includes("password")) {
      return "Password does not meet requirements. Please try again.";
    }
    return error || "Registration failed. Please try again.";
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setShowOTPModal(false); // Ensure OTP modal is closed initially
      setPendingUserData(null); // Clear pending data initially
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const json = await res.json();
      
      // Check if email is taken or any other error occurred
      if (!res.ok) {
        const errorMsg = getErrorMessage(json.error || "Registration failed");
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        
        // Ensure OTP modal is closed if there's an error
        setShowOTPModal(false);
        setPendingUserData(null);
        
        // Set field-specific errors
        const lowerError = (json.error || "").toLowerCase();
        if (
          lowerError.includes("email is taken") ||
          lowerError.includes("already") ||
          lowerError.includes("taken") ||
          res.status === 409
        ) {
          setError("email", { type: "manual", message: "Email is taken" });
        } else if (lowerError.includes("email") && !lowerError.includes("taken") && !lowerError.includes("already")) {
          setError("email", { type: "manual", message: "Invalid email address" });
        } else if (lowerError.includes("password")) {
          setError("password", { type: "manual", message: "Password does not meet requirements" });
        }
        
        setIsLoading(false);
        return; // Exit early - don't show OTP modal
      }
      
      // Only show OTP modal if registration was successful
      if (res.ok && json.success) {
        setPendingUserData(data);
        setShowOTPModal(true);
        toast.info(`Check your email for a verification code.`);
      }
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error.message || "Unexpected error");
      toast.error(error.message || "Unexpected error");
      // Ensure OTP modal is closed on error
      setShowOTPModal(false);
      setPendingUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      setIsVerifyingOTP(true);
      if (!pendingUserData) {
        toast.error("No pending user data.");
        return;
      }
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingUserData.email,
          code: otp,
          context: "register",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Verification failed");
        return;
      }
      toast.success("Registration verified! You can now sign in.");
      setShowOTPModal(false);
      router.push("/login");
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Unexpected error");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingUserData) return;
    // Re-trigger signUp to resend email
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pendingUserData.name,
        email: pendingUserData.email,
        password: pendingUserData.password,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to resend code");
      return;
    }
    toast.info("Verification code resent.");
  };

  return (
  <div className="min-h-screen bg-linear-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join ScholarBlock and start your scholarship journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    onChange={() => setErrorMessage("")}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    onChange={() => setErrorMessage("")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password", {
                      onChange: () => {
                        setErrorMessage("");
                      }
                    })}
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className={`pl-10 pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        isLoading={isVerifyingOTP}
        email={pendingUserData?.email}
  length={6}
      />
    </div>
  );
}
