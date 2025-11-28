"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();
    if (
      lowerError.includes("invalid login credentials") ||
      lowerError.includes("invalid credentials")
    ) {
      return "Wrong credentials. Please check your email and password.";
    }
    if (lowerError.includes("password")) {
      return "Wrong password. Please try again.";
    }
    if (
      lowerError.includes("email not confirmed") ||
      lowerError.includes("confirm")
    ) {
      return "Email not confirmed. Please check your inbox for a verification code.";
    }
    return error || "Login failed. Please try again.";
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Ensure we have the current password value (in case type change caused issues)
      // Try multiple methods to get the password value
      let passwordValue = getValues("password") || data.password;

      // Fallback: get value directly from DOM if React Hook Form doesn't have it
      if (!passwordValue) {
        const passwordInput = document.getElementById(
          "password"
        ) as HTMLInputElement;
        if (passwordInput) {
          passwordValue = passwordInput.value;
        }
      }

      const formData = {
        email: data.email,
        password: passwordValue,
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        const errorMsg = getErrorMessage(json.error || "Login failed");
        setErrorMessage(errorMsg);
        toast.error(errorMsg);

        // Set field-specific errors
        if (json.error?.toLowerCase().includes("password")) {
          setError("password", { type: "manual", message: "Wrong password" });
        } else if (
          json.error?.toLowerCase().includes("invalid login credentials")
        ) {
          setError("email", { type: "manual", message: "Invalid credentials" });
          setError("password", {
            type: "manual",
            message: "Invalid credentials",
          });
        }

        setIsLoading(false);
        return;
      }
      // Determine user role - Always query User table directly as source of truth
      // This ensures we get the correct role before redirecting
      let isAdmin = false;
      const normalizedEmail = formData.email.toLowerCase().trim();
      const supabase = getSupabaseBrowserClient();

      // Always query User table directly to get the role (most reliable)
      try {
        const { data: dbUser, error: dbError } = await supabase
          .from("User")
          .select("role")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (dbError) {
          console.error("Error fetching user role from DB:", dbError);
          // Fallback to API response if DB query fails
          const apiRole = (json.role || json.user?.role || "")
            .toUpperCase()
            .trim();
          isAdmin = apiRole === "ADMIN";
        } else if (dbUser?.role) {
          const userRole = dbUser.role.toUpperCase().trim();
          isAdmin = userRole === "ADMIN";
        } else {
          // If DB query returns no user, fallback to API response
          const apiRole = (json.role || json.user?.role || "")
            .toUpperCase()
            .trim();
          isAdmin = apiRole === "ADMIN";
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        // Fallback to API response if DB query throws
        const apiRole = (json.role || json.user?.role || "")
          .toUpperCase()
          .trim();
        isAdmin = apiRole === "ADMIN";
      }

      // Refresh the session on the client side to ensure cookies are synced
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session) {
        toast.success("Login successful!");
        const redirectPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";
        console.log("Redirecting to:", redirectPath, "isAdmin:", isAdmin);
        // Use window.location for a full page reload to ensure session is picked up
        window.location.href = redirectPath;
      } else {
        // If session not immediately available, wait a bit and try again
        await new Promise((resolve) => setTimeout(resolve, 300));
        const { data: retrySession } = await supabase.auth.getSession();
        if (retrySession?.session) {
          toast.success("Login successful!");
          const redirectPath = isAdmin ? "/admin-dashboard" : "/user-dashboard";
          console.log(
            "Redirecting to (retry):",
            redirectPath,
            "isAdmin:",
            isAdmin
          );
          window.location.href = redirectPath;
        } else {
          toast.error("Session not found. Please try again.");
          setIsLoading(false);
        }
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <NextImage
                  src="/iskolarblock.svg"
                  alt="IskolarBlock Logo"
                  fill
                  className="object-contain"
                  priority
                  quality={90}
                  sizes="48px"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your IskolarBlock account
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juandelacruz@gmail.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                  onChange={() => setErrorMessage("")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register("password", {
                      onChange: (e) => {
                        setErrorMessage("");
                      },
                    })}
                    className={
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Preserve the password value when toggling visibility
                      // Try to get value from React Hook Form first, then from DOM
                      let currentPassword = getValues("password");
                      if (!currentPassword) {
                        const passwordInput = document.getElementById(
                          "password"
                        ) as HTMLInputElement;
                        if (passwordInput) {
                          currentPassword = passwordInput.value;
                        }
                      }
                      setShowPassword(!showPassword);
                      // Ensure the value is preserved after type change
                      if (currentPassword) {
                        // Use setTimeout to ensure the value is set after the type change
                        setTimeout(() => {
                          setValue("password", currentPassword, {
                            shouldValidate: false,
                            shouldDirty: true,
                          });
                        }, 0);
                      }
                    }}
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
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to IskolarBlock?
                  </span>
                </div>
              </div>

              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Create an Account
                </Button>
              </Link>
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
    </div>
  );
}
