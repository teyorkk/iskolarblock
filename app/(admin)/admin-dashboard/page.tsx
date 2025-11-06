'use client'

import { motion } from "framer-motion"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Coins, 
  TrendingUp, 
  FileText, 
  Plus,
  ArrowUp,
  ArrowDown,
  Calendar,
  Shield,
  Award
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { mockChartData, mockApplicants } from "@/lib/mock-data"

const statsCards = [
  {
    title: "Total Applicants",
    value: "156",
    description: "This month",
    icon: Users,
    color: "bg-blue-500",
    trend: "+12.5%",
    trendUp: true
  },
  {
    title: "Total Budget",
    value: "₱500,000",
    description: "Allocated funds",
    icon: Coins,
    color: "bg-green-500",
    trend: "+8.2%",
    trendUp: true
  },
  {
    title: "Remaining Budget",
    value: "₱125,000",
    description: "Available funds",
    icon: TrendingUp,
    color: "bg-orange-500",
    trend: "-25%",
    trendUp: false
  },
  {
    title: "Pending Reviews",
    value: "23",
    description: "Awaiting approval",
    icon: FileText,
    color: "bg-purple-500",
    trend: "+5",
    trendUp: true
  }
]

const pieData = [
  { name: 'Approved', value: 45, color: '#10b981' },
  { name: 'Pending', value: 30, color: '#f97316' },
  { name: 'Rejected', value: 25, color: '#ef4444' },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white mb-6">
              <div className="max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-red-100 mb-4">
                  Manage scholarship applications, budget allocation, and blockchain records for Barangay San Miguel.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" className="bg-white text-red-600 hover:bg-gray-100">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Budget
                  </Button>
                  <Button variant="outline" className="border-white text-red-600 hover:bg-gray-100">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>

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
                        {stat.trendUp ? (
                          <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${
                          stat.trendUp ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
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
                      <Calendar className="w-5 h-5 mr-2 text-red-500" />
                      Application Trends
                    </CardTitle>
                    <CardDescription>
                      Monthly scholarship application statistics
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
                            stroke="#dc2626" 
                            strokeWidth={2}
                            dot={{ fill: '#dc2626', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Status Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-red-500" />
                      Application Status
                    </CardTitle>
                    <CardDescription>
                      Current distribution of applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Applicants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-red-500" />
                        Recent Applicants
                      </CardTitle>
                      <CardDescription>
                        Latest scholarship applications submitted
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockApplicants.slice(0, 4).map((applicant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {applicant.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{applicant.name}</p>
                            <p className="text-sm text-gray-500">{applicant.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              applicant.status === 'Approved' ? 'default' :
                              applicant.status === 'Pending' ? 'secondary' :
                              'destructive'
                            }
                            className={
                              applicant.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              applicant.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }
                          >
                            {applicant.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{applicant.submittedDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="w-full">
                      View All Applicants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-red-50 hover:border-red-200">
                      <Users className="w-6 h-6 mb-2 text-red-500" />
                      <span className="text-sm">Review Applications</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-red-50 hover:border-red-200">
                      <Coins className="w-6 h-6 mb-2 text-red-500" />
                      <span className="text-sm">Manage Budget</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-red-50 hover:border-red-200">
                      <Shield className="w-6 h-6 mb-2 text-red-500" />
                      <span className="text-sm">Blockchain Records</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-red-50 hover:border-red-200">
                      <Award className="w-6 h-6 mb-2 text-red-500" />
                      <span className="text-sm">Award Scholarships</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
