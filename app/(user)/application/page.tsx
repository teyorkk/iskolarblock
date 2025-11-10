"use client";

import { motion } from "framer-motion";
import { FileText, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserSidebar } from "@/components/user-sidebar";
import Link from "next/link";

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Scholarship Application
              </h1>
              <p className="text-gray-600">
                Choose the type of application you want to submit
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/application/new" className="block h-full">
                <Card className="flex h-full cursor-pointer flex-col transition-all hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      New Application
                    </CardTitle>
                    <CardDescription>
                      First-time scholarship applicant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Apply for a scholarship for the first time. You will need
                      to complete your personal information and upload required
                      documents.
                    </p>
                    <div className="mt-4 text-sm font-medium text-blue-600">
                      5 steps • ~15 minutes
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/application/renewal" className="block h-full">
                <Card className="flex h-full cursor-pointer flex-col transition-all hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      Renewal Application
                    </CardTitle>
                    <CardDescription>
                      Continuing your scholarship
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Renew your existing scholarship. You will need to verify
                      your identity and upload updated documents.
                    </p>
                    <div className="mt-4 text-sm font-medium text-green-600">
                      3 steps • ~10 minutes
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
