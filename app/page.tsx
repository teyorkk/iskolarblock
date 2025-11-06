'use client'

import { motion } from "framer-motion"
import { ArrowRight, Shield, FileText, Eye, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import Link from "next/link"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "All scholarship records are secured and verified using blockchain technology",
    },
    {
      icon: FileText,
      title: "Easy Application",
      description: "Simple and streamlined application process with real-time status updates",
    },
    {
      icon: Eye,
      title: "Transparent Processing",
      description: "Track your application status with complete transparency at every step",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ScholarBlock</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-orange-500 transition-colors">
                Login
              </Link>
              <Link href="/register">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-3">
                <Link href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">
                  Features
                </Link>
                <Link href="#about" className="text-gray-600 hover:text-orange-500 transition-colors">
                  About
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-orange-500 transition-colors">
                  Login
                </Link>
                <Link href="/register">
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
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300 rounded-full opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ScholarBlock
              <span className="block text-lg md:text-2xl font-normal text-gray-600 mt-2">
                Empowering Scholars Through Blockchain Transparency
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              A revolutionary scholarship management system for Barangay San Miguel, Hagonoy. 
              Secure, transparent, and efficient - powered by blockchain technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ScholarBlock?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of scholarship management with our innovative blockchain-powered platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="transform transition-all duration-300"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About Barangay San Miguel, Hagonoy
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              ScholarBlock is dedicated to supporting the educational aspirations of our youth in 
              Barangay San Miguel. Through transparent and efficient scholarship management, we ensure 
              that deserving students receive the financial support they need to pursue their dreams.
            </p>
            <div className="bg-orange-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Our Commitment
              </h3>
              <p className="text-gray-700">
                We believe in the power of education to transform lives and communities. 
                By leveraging blockchain technology, we bring unprecedented transparency and 
                efficiency to scholarship distribution, ensuring every peso is used for its intended purpose.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">ScholarBlock</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 ScholarBlock. Barangay San Miguel, Hagonoy
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Empowering scholars through blockchain transparency
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
