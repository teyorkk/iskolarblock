"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  AlertCircle,
  Mail,
  Phone,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppBackground } from "@/components/common/app-background";
import { LandingFooter } from "@/components/landing/landing-footer";

export function PrivacyPageClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white relative">
      <AppBackground />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <NextImage
                  src="/iskolarblock.svg"
                  alt="IskolarBlock Logo"
                  fill
                  className="object-contain"
                  priority
                  quality={90}
                  sizes="32px"
                />
              </div>
              <span className="font-bold text-xl text-gray-900">
                IskolarBlock
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Login
              </Link>
              <Link href="/register">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <Shield className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              User Assistance Guidelines & Data Privacy
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Your privacy and data protection are our top priorities
            </p>
            <p className="text-sm text-gray-500">
              Last Updated: December 2, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 pb-20 relative">
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  IskolarBlock is committed to protecting your privacy and
                  ensuring the security of your personal information. This User
                  Assistance Guidelines and Data Privacy Policy is in accordance
                  with the <strong>Republic Act No. 10173</strong>, also known
                  as the <strong>Data Privacy Act of 2012 (DPA)</strong>, and
                  its implementing rules and regulations.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using the IskolarBlock platform, you consent to the
                  collection, use, and disclosure of your personal data as
                  described in this policy.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-500" />
                  What Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We collect the following types of personal information:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Personal Identification Information:
                      </strong>
                      <p className="text-gray-700">
                        Full name, date of birth, address, contact number, email
                        address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Academic Information:
                      </strong>
                      <p className="text-gray-700">
                        School name, course/program, year level, student ID
                        number, grades, and transcripts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Financial Information:
                      </strong>
                      <p className="text-gray-700">
                        Family income, scholarship application details, grant
                        information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Supporting Documents:
                      </strong>
                      <p className="text-gray-700">
                        Valid IDs, certificates of enrollment, proof of income,
                        and other required documentation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        System Information:
                      </strong>
                      <p className="text-gray-700">
                        IP address, browser type, device information, login
                        timestamps
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-orange-500" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Your personal information is used for the following purposes:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Processing and evaluating scholarship applications
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Verifying eligibility and authenticating applicant
                      information
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Communicating application status and scholarship updates
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Recording scholarship transactions on the blockchain for
                      transparency and audit trails
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Generating reports and statistics for program improvement
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Ensuring system security and preventing fraudulent
                      activities
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      Complying with legal and regulatory requirements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  Data Security and Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect
                  your personal information:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Encryption:</strong> All personal data is
                      encrypted both in transit and at rest using advanced
                      encryption standards
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Access Control:</strong> Only authorized personnel
                      have access to personal information on a need-to-know
                      basis
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Blockchain Technology:</strong> Transaction
                      records are stored on an immutable blockchain ledger for
                      added security and transparency
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Regular Audits:</strong> We conduct periodic
                      security audits and vulnerability assessments
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Secure Authentication:</strong> Multi-factor
                      authentication and strong password requirements protect
                      your account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Your Rights Under the Data Privacy Act
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  As a data subject, you have the following rights:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to be Informed:</strong> You have the right
                      to know how your data is being collected, used, and shared
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to Access:</strong> You can request access
                      to your personal data held by IskolarBlock
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to Rectification:</strong> You can request
                      correction of inaccurate or incomplete personal
                      information
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to Erasure/Blocking:</strong> You can
                      request deletion or blocking of your data under certain
                      circumstances
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to Object:</strong> You can object to the
                      processing of your data for certain purposes
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to Data Portability:</strong> You can obtain
                      and reuse your personal data for your own purposes
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      <strong>Right to File a Complaint:</strong> You can file a
                      complaint with the National Privacy Commission if you
                      believe your rights have been violated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this policy, unless a
                  longer retention period is required by law. Scholarship
                  application records and related data are retained for a
                  minimum of five (5) years for audit and compliance purposes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  After the retention period, personal data will be securely
                  deleted or anonymized, except for information permanently
                  recorded on the blockchain for transparency purposes.
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Data Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  IskolarBlock does not sell, rent, or trade your personal
                  information to third parties. We may share your data only in
                  the following circumstances:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      With educational institutions to verify enrollment and
                      academic records
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      With government agencies as required by law or regulation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      With authorized barangay officials for scholarship program
                      administration
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-gray-700">
                      With service providers who assist in operating our
                      platform, subject to strict confidentiality agreements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-500" />
                  Contact Our Data Protection Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions, concerns, or requests regarding
                  your personal data or this privacy policy, please contact our
                  Data Protection Officer:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> iskolarblock60@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> Barangay San Miguel, Hagonoy,
                    Bulacan
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  You may also file a complaint with the National Privacy
                  Commission at <strong>privacy@npc.gov.ph</strong> or visit
                  their website at <strong>www.privacy.gov.ph</strong>
                </p>
              </CardContent>
            </Card>

            {/* Updates to Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We may update this User Assistance Guidelines and Data Privacy
                  Policy from time to time to reflect changes in our practices
                  or legal requirements. We will notify you of any material
                  changes by posting the updated policy on our platform and
                  updating the &quot;Last Updated&quot; date at the top of this
                  page.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of the IskolarBlock platform after any
                  changes indicates your acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
