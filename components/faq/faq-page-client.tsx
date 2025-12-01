"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, Book, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { AppBackground } from "@/components/common/app-background";
import { LandingFooter } from "@/components/landing/landing-footer";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "General",
    question: "What is IskolarBlock?",
    answer:
      "IskolarBlock is a blockchain-powered scholarship management system that provides transparent, secure, and efficient processing of scholarship applications. It uses blockchain technology to ensure the integrity and transparency of all scholarship transactions and decisions.",
  },
  {
    category: "General",
    question: "How does blockchain technology benefit the scholarship process?",
    answer:
      "Blockchain technology provides an immutable, transparent record of all scholarship transactions and decisions. This ensures that all processes are auditable, tamper-proof, and trustworthy. Every action is permanently recorded on the blockchain, creating a complete audit trail.",
  },
  {
    category: "General",
    question: "Is IskolarBlock free to use?",
    answer:
      "Yes, IskolarBlock is free for scholarship applicants. The platform is designed to make scholarship opportunities more accessible to students without any cost barriers.",
  },
  {
    category: "Application",
    question: "How do I apply for a scholarship?",
    answer:
      "First, create an account and complete your profile. When an application cycle is active, navigate to the Application page from your dashboard. Fill out the required information, upload necessary documents, and submit your application. You'll receive confirmation once submitted.",
  },
  {
    category: "Application",
    question: "What documents do I need to submit?",
    answer:
      "Typically, you'll need to provide a valid ID (school ID, government ID, etc.), proof of enrollment, academic transcripts, and any additional supporting documents specified in the application form. All documents should be in PDF, JPG, or PNG format.",
  },
  {
    category: "Application",
    question: "Can I edit my application after submission?",
    answer:
      "No, once submitted, applications cannot be edited. This is to maintain the integrity of the application process and ensure fairness. Please review your application carefully before submitting.",
  },
  {
    category: "Application",
    question: "How long does the application review process take?",
    answer:
      "The review timeline depends on the specific scholarship cycle and the number of applications received. Typically, you can expect a decision within 2-4 weeks after the application deadline. You'll be notified via email once a decision is made.",
  },
  {
    category: "Application",
    question: "What happens if my application is approved?",
    answer:
      "If approved, you'll receive an email notification and see the status update in your dashboard. The approval and any subsequent fund disbursements are recorded on the blockchain for complete transparency and traceability.",
  },
  {
    category: "Account",
    question: "How do I create an account?",
    answer:
      "Click the 'Get Started' or 'Register' button on the homepage. Fill in your email, create a password, and complete the registration form. You'll receive a confirmation email to verify your account.",
  },
  {
    category: "Account",
    question: "I forgot my password. What should I do?",
    answer:
      "Click on 'Forgot Password' on the login page. Enter your email address, and you'll receive a password reset link. Follow the instructions in the email to create a new password.",
  },
  {
    category: "Account",
    question: "Can I update my profile information?",
    answer:
      "Yes, you can update your profile information at any time through the Settings page in your dashboard. However, changes made after submitting an application will not affect that application.",
  },
  {
    category: "Security",
    question: "Is my personal information secure?",
    answer:
      "Yes, we take security very seriously. All personal data is encrypted and stored securely. We use industry-standard security practices including encryption, secure authentication, and regular security audits. Sensitive transaction data is recorded on the blockchain for added security.",
  },
  {
    category: "Security",
    question: "Who can access my application data?",
    answer:
      "Only authorized administrators involved in the scholarship review process can access your application data. Your information is never shared with third parties without your consent, except as required by law.",
  },
  {
    category: "Security",
    question: "What is stored on the blockchain?",
    answer:
      "The blockchain stores transaction records, application statuses, approval decisions, and fund disbursement information. Personal identifying information is not stored on the blockchain itself but is securely stored in encrypted databases.",
  },
  {
    category: "Technical",
    question: "What browsers are supported?",
    answer:
      "IskolarBlock works best on modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. We recommend keeping your browser updated to the latest version for the best experience.",
  },
  {
    category: "Technical",
    question: "I'm having trouble uploading documents. What should I do?",
    answer:
      "Ensure your documents are in the correct format (PDF, JPG, or PNG) and under the file size limit (usually 10MB per file). If problems persist, try using a different browser, clearing your browser cache, or checking your internet connection.",
  },
  {
    category: "Technical",
    question: "Can I access IskolarBlock on my mobile device?",
    answer:
      "Yes, IskolarBlock is fully responsive and works on mobile devices. You can access all features from your smartphone or tablet through your mobile browser.",
  },
];

const categories = [
  { name: "All", icon: Book },
  { name: "General", icon: HelpCircle },
  { name: "Application", icon: Users },
  { name: "Account", icon: Shield },
  { name: "Security", icon: Shield },
  { name: "Technical", icon: Zap },
];

export function FAQPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white relative">
      <AppBackground />
      {/* Navigation */}
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
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Home
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <HelpCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about IskolarBlock
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                className="pl-12 pr-4 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 relative">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  className={
                    selectedCategory === category.name
                      ? "bg-orange-500 hover:bg-orange-600"
                      : ""
                  }
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 pb-20 relative">
        <div className="container mx-auto max-w-4xl relative z-10">
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white rounded-lg border shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                          Q
                        </span>
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="flex items-start gap-3 pl-9">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter to find what you&apos;re
                  looking for.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
