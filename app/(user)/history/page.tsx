'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Filter,
  Download
} from "lucide-react"
import { mockApplications } from "@/lib/mock-data"

const statusColors = {
  Approved: 'bg-green-100 text-green-700',
  Pending: 'bg-orange-100 text-orange-700',
  Rejected: 'bg-red-100 text-red-700',
}

const statusIcons = {
  Approved: CheckCircle,
  Pending: Clock,
  Rejected: XCircle,
}

export default function HistoryPage() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [filter, setFilter] = useState<string>('all')

  const filteredApplications = mockApplications.filter((app: any) => 
    filter === 'all' || app.status === filter
  )

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons]
    return <Icon className="w-4 h-4" />
  }

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
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application History</h1>
                <p className="text-gray-600">Track and manage your scholarship applications</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => window.location.href = '/user/application'}>
                  New Application
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{mockApplications.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {mockApplications.filter(app => app.status === 'Approved').length}
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
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {mockApplications.filter(app => app.status === 'Pending').length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All ({mockApplications.length})
                  </Button>
                  <Button
                    variant={filter === 'Pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('Pending')}
                  >
                    Pending ({mockApplications.filter((app: any) => app.status === 'Pending').length})
                  </Button>
                  <Button
                    variant={filter === 'Approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('Approved')}
                  >
                    Approved ({mockApplications.filter((app: any) => app.status === 'Approved').length})
                  </Button>
                  <Button
                    variant={filter === 'Rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('Rejected')}
                  >
                    Rejected ({mockApplications.filter((app: any) => app.status === 'Rejected').length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Applications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Applications</CardTitle>
                <CardDescription>
                  View the status and details of all your scholarship applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application: any, index: number) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            SCH-{String(application.id).padStart(6, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {application.date}
                            </div>
                          </TableCell>
                          <TableCell>{application.type}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={statusColors[application.status as keyof typeof statusColors]}
                            >
                              <div className="flex items-center">
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{application.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {application.remarks}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Application Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information about your scholarship application
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600">Application ID</p>
                                        <p className="font-medium">SCH-{String(selectedApplication.id).padStart(6, '0')}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Date Submitted</p>
                                        <p className="font-medium">{selectedApplication.date}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600">Type</p>
                                        <p className="font-medium">{selectedApplication.type}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <Badge 
                                          variant="secondary"
                                          className={statusColors[selectedApplication.status as keyof typeof statusColors]}
                                        >
                                          {selectedApplication.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm text-gray-600">Remarks</p>
                                      <p className="font-medium">{selectedApplication.remarks}</p>
                                    </div>
                                    
                                    <div className="pt-4 border-t">
                                      <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-600">Documents</p>
                                        <Button variant="outline" size="sm">
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredApplications.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No applications found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilter('all')}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
