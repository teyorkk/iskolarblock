'use client'

import { motion } from "framer-motion"
import { useState } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Camera, 
  FileText, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { applicationSchema, type ApplicationFormData } from "@/lib/validations"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"

const steps = [
  { id: 1, name: 'Application Type', icon: FileText },
  { id: 2, name: 'Upload ID', icon: Upload },
  { id: 3, name: 'Face Scan', icon: Camera },
  { id: 4, name: 'Personal Info', icon: User },
]

export default function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  })

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0])
      setValue('idDocument', acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  })

  const onSubmit = (data: ApplicationFormData) => {
    setIsSubmitted(true)
    toast.success('Application submitted successfully!')
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFaceScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      nextStep()
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-green-600">
                    Application Submitted!
                  </CardTitle>
                  <CardDescription>
                    Your scholarship application has been successfully submitted and is now under review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Application ID:</strong> SCH-{Date.now()}<br />
                      <strong>Status:</strong> Under Review<br />
                      <strong>Estimated Response:</strong> 5-7 business days
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => window.location.href = '/user/dashboard'}>
                      Back to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/user/history'}>
                      View Application History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
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
            className="max-w-4xl mx-auto"
          >
            {/* Progress Bar */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Scholarship Application</CardTitle>
                <CardDescription>
                  Complete all steps to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={(currentStep / steps.length) * 100} className="h-2" />
                  <div className="grid grid-cols-4 gap-2">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`text-center ${
                          currentStep >= step.id ? 'text-orange-600' : 'text-gray-400'
                        }`}
                      >
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          currentStep >= step.id ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-medium">{step.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-orange-500" />
                      Application Type
                    </CardTitle>
                    <CardDescription>
                      Select the type of scholarship application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card 
                        className={`cursor-pointer transition-all ${
                          watch('type') === 'new' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-md'
                        }`}
                        onClick={() => setValue('type', 'new')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">New Application</h3>
                              <p className="text-sm text-gray-600">First-time scholarship applicant</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all ${
                          watch('type') === 'renewal' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-md'
                        }`}
                        onClick={() => setValue('type', 'renewal')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Renewal</h3>
                              <p className="text-sm text-gray-600">Continuing your scholarship</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {errors.type && (
                      <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-orange-500" />
                      Upload ID Document
                    </CardTitle>
                    <CardDescription>
                      Upload a valid government ID (PDF, JPG, or PNG)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      {uploadedFile ? (
                        <div>
                          <p className="font-medium text-green-600">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">File uploaded successfully</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">
                            {isDragActive ? 'Drop the file here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-sm text-gray-500">PDF, JPG, or PNG (max. 5MB)</p>
                        </div>
                      )}
                    </div>
                    {errors.idDocument && (
                      <p className="text-sm text-red-500 mt-2">Please upload a valid ID document</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-orange-500" />
                      Face Scan Verification
                    </CardTitle>
                    <CardDescription>
                      Position your face in the frame for identity verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative w-64 h-64 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                        {isScanning ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 border-4 border-orange-500 border-t-transparent rounded-full"
                          />
                        ) : (
                          <Camera className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                      {isScanning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                            <p className="text-sm font-medium">Scanning...</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Ensure good lighting and keep your face centered in the frame
                    </p>
                    <Button onClick={handleFaceScan} disabled={isScanning}>
                      {isScanning ? 'Scanning...' : 'Start Face Scan'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-orange-500" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Complete your personal and academic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            {...register("fullName")}
                            placeholder="Enter your full name"
                          />
                          {errors.fullName && (
                            <p className="text-sm text-red-500">{errors.fullName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            {...register("age")}
                            placeholder="Enter your age"
                          />
                          {errors.age && (
                            <p className="text-sm text-red-500">{errors.age.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          {...register("address")}
                          placeholder="Enter your complete address"
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="school">School</Label>
                          <Input
                            id="school"
                            {...register("school")}
                            placeholder="Enter your school name"
                          />
                          {errors.school && (
                            <p className="text-sm text-red-500">{errors.school.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="course">Course</Label>
                          <Input
                            id="course"
                            {...register("course")}
                            placeholder="Enter your course"
                          />
                          {errors.course && (
                            <p className="text-sm text-red-500">{errors.course.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="yearLevel">Year Level</Label>
                          <Select onValueChange={(value) => setValue('yearLevel', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                              <SelectItem value="4">4th Year</SelectItem>
                              <SelectItem value="5">5th Year</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.yearLevel && (
                            <p className="text-sm text-red-500">{errors.yearLevel.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gwa">GWA</Label>
                          <Input
                            id="gwa"
                            {...register("gwa")}
                            placeholder="Enter your GWA"
                          />
                          {errors.gwa && (
                            <p className="text-sm text-red-500">{errors.gwa.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms" className="text-sm">
                          I certify that all information provided is true and accurate
                        </Label>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={currentStep === 4 ? handleSubmit(onSubmit) : nextStep}
                disabled={
                  (currentStep === 1 && !watch('type')) ||
                  (currentStep === 2 && !uploadedFile) ||
                  (currentStep === 4 && !watch('fullName'))
                }
              >
                {currentStep === 4 ? 'Submit Application' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
