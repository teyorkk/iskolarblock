'use client'

import { motion } from "framer-motion"
import { useEffect } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Calendar,
  History
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { mockChartData, mockApplications } from "@/lib/mock-data"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

const statsCards = [
  {
    title: "Total Applications",
    value: "3",
    description: "All time applications",
    icon: FileText,
    color: "bg-blue-500",
    trend: "+12% from last month"
  },
  {
    title: "Pending Review",
    value: "1",
    description: "Awaiting approval",
    icon: Clock,
    color: "bg-orange-500",
    trend: "No change"
  },
  {
    title: "Approved",
    value: "1",
    description: "Successfully approved",
    icon: CheckCircle,
    color: "bg-green-500",
    trend: "+1 this month"
  },
  {
    title: "Profile Completion",
    value: "85%",
    description: "Almost complete",
    icon: Users,
    color: "bg-purple-500",
    trend: "Update profile"
  }
]

export default function UserDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />
      
      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white mb-6"
          >
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-orange-100 mb-4">
                Track your scholarship applications and manage your academic journey with ScholarBlock.
              </p>
              <Link href="/user/application">
                <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                  New Application
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">{stat.trend}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                    Application Trends
                  </CardTitle>
                  <CardDescription>
                    Your scholarship application activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="applications" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          dot={{ fill: '#f97316', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-500" />
                    Recent Applications
                  </CardTitle>
                  <CardDescription>
                    Your latest scholarship submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockApplications.slice(0, 3).map((application, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {application.type} Application
                          </p>
                          <p className="text-xs text-gray-500">{application.date}</p>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'Approved' ? 'default' :
                            application.status === 'Pending' ? 'secondary' :
                            'destructive'
                          }
                          className={
                            application.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            application.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/user/history">
                      <Button variant="outline" className="w-full">
                        View All Applications
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and helpful resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/user/application">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-200">
                      <FileText className="w-6 h-6 mb-2 text-orange-500" />
                      <span className="text-sm">New Application</span>
                    </Button>
                  </Link>
                  <Link href="/user/history">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-200">
                      <History className="w-6 h-6 mb-2 text-orange-500" />
                      <span className="text-sm">View History</span>
                    </Button>
                  </Link>
                  <Link href="/user/settings">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-200">
                      <Users className="w-6 h-6 mb-2 text-orange-500" />
                      <span className="text-sm">Update Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
