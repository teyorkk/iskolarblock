"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);
      setUserEmail(data.email);

      let res: Response;
      try {
        res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });
      } catch (fetchError) {
        // Network error
        const errorMsg =
          "Network error. Please check your connection and try again.";
        setApiError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      let json;
      try {
        const text = await res.text();
        if (text) {
          json = JSON.parse(text);
        } else {
          json = {};
        }
      } catch (parseError) {
        // Invalid JSON response
        console.error("Failed to parse response:", parseError);
        const errorMsg = "Server error. Please try again later.";
        setApiError(errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errorMessage =
          json?.error ||
          `Request failed with status ${res.status}. Please try again.`;
        console.error("Forgot password API error:", {
          status: res.status,
          statusText: res.statusText,
          error: json?.error,
          fullResponse: json,
        });
        setApiError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      setApiError(null);
      setShowOTPModal(true);
      toast.success(
        json?.message || "Check your email for a verification code."
      );
    } catch (e) {
      const error = e as Error;
      console.error("Unexpected error in forgot password:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      setIsVerifyingOTP(true);

      if (!userEmail) {
        toast.error("Email address is missing. Please start over.");
        setShowOTPModal(false);
        return;
      }

      let res: Response;
      try {
        res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            code: otp,
            context: "forgot",
          }),
        });
      } catch (fetchError) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
        throw new Error("Network error");
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        toast.error("Server error. Please try again later.");
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        const errorMsg =
          json?.error ||
          "Verification failed. Please check your code and try again.";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      setShowOTPModal(false);
      toast.success("Email verified! Redirecting to password reset...");
      router.push("/reset-password");
    } catch (e) {
      const error = e as Error;
      // Only show toast if it's not already shown
      if (
        !error.message.includes("Network") &&
        !error.message.includes("Invalid")
      ) {
        toast.error(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
      throw error;
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userEmail) {
      toast.error("Email address is missing. Please start over.");
      return;
    }

    try {
      let res: Response;
      try {
        res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
      } catch (fetchError) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
        return;
      }

      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        toast.error("Server error. Please try again later.");
        return;
      }

      if (!res.ok) {
        const errorMessage =
          json?.error ||
          "Failed to resend verification code. Please try again.";
        toast.error(errorMessage);
        return;
      }

      toast.success(
        json?.message || "Verification code has been resent to your email."
      );
    } catch (e) {
      const error = e as Error;
      console.error("Error resending OTP:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email address and we&apos;ll send you instructions to
              reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
                {apiError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-800">{apiError}</p>
                  </div>
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
                  "Send Reset OTP"
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
                    Remember your password?
                  </span>
                </div>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
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

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        isLoading={isVerifyingOTP}
        email={userEmail}
        title="Verify Your Email"
        description="Enter the 8-digit verification code sent to your email address."
        length={8}
      />
    </div>
  );
}
