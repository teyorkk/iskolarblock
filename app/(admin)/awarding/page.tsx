'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Award, 
  Coins, 
  CheckCircle,
  Calendar,
  User,
  Mail,
  FileText
} from "lucide-react"
import { mockEligibleScholars } from "@/lib/mock-data"

export default function AwardingPage() {
  const [selectedScholar, setSelectedScholar] = useState<any>(null)
  const [isAwarding, setIsAwarding] = useState(false)

  const handleAwardScholarship = (scholarId: string) => {
    setIsAwarding(true)
    setTimeout(() => {
      setIsAwarding(false)
      // You could add a toast notification here
    }, 1000)
  }

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
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scholarship Awarding</h1>
                <p className="text-gray-600">Manage and distribute scholarships to eligible students</p>
              </div>
              <Button className="mt-4 md:mt-0">
                <Award className="w-4 h-4 mr-2" />
                Award New Scholarship
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Scholars</p>
                      <p className="text-2xl font-bold text-gray-900">{mockEligibleScholars.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Awards</p>
                      <p className="text-2xl font-bold text-green-600">
                        {mockEligibleScholars.filter(scholar => scholar.status === 'Active').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Disbursed</p>
                      <p className="text-2xl font-bold text-orange-600">₱375,000</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Awards</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {mockEligibleScholars.filter(scholar => scholar.status === 'Pending').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scholars Table */}
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Recipients</CardTitle>
                <CardDescription>
                  Manage awarded scholarships and recipient information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scholar</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Scholarship Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Award Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEligibleScholars.map((scholar, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{scholar.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {scholar.email}
                            </div>
                          </TableCell>
                          <TableCell>{scholar.scholarshipType}</TableCell>
                          <TableCell className="font-medium">₱{scholar.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                scholar.status === 'Active' ? 'default' :
                                scholar.status === 'Pending' ? 'secondary' :
                                'destructive'
                              }
                              className={
                                scholar.status === 'Active' ? 'bg-green-100 text-green-700' :
                                scholar.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }
                            >
                              {scholar.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{scholar.awardDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedScholar(scholar)}
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Scholarship Details</DialogTitle>
                                    <DialogDescription>
                                      Complete information about the awarded scholarship
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedScholar && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Scholar Name</p>
                                          <p className="font-medium">{selectedScholar.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Email</p>
                                          <p className="font-medium">{selectedScholar.email}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Scholarship Type</p>
                                          <p className="font-medium">{selectedScholar.scholarshipType}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Amount</p>
                                          <p className="font-medium">₱{selectedScholar.amount.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Status</p>
                                          <Badge variant="default" className="bg-green-100 text-green-700">
                                            {selectedScholar.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Award Date</p>
                                          <p className="font-medium">{selectedScholar.awardDate}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600 mb-2">Academic Information</p>
                                        <div className="bg-gray-50 p-3 rounded">
                                          <p className="text-sm"><strong>School:</strong> {selectedScholar.school}</p>
                                          <p className="text-sm"><strong>Course:</strong> {selectedScholar.course}</p>
                                          <p className="text-sm"><strong>Year Level:</strong> {selectedScholar.yearLevel}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              {scholar.status === 'Pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600"
                                  onClick={() => handleAwardScholarship(scholar.id)}
                                  disabled={isAwarding}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
