import { ApplicationFormData } from './validations'

export const mockUser = {
  id: '1',
  name: 'Juan Dela Cruz',
  email: 'juan@example.com',
  role: 'user' as const,
}

export const mockAdmin = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@scholarblock.com',
  role: 'admin' as const,
}

export const mockApplications = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'New',
    status: 'Approved',
    remarks: 'Complete requirements',
  },
  {
    id: '2',
    date: '2024-02-20',
    type: 'Renewal',
    status: 'Pending',
    remarks: 'Under review',
  },
  {
    id: '3',
    date: '2024-03-10',
    type: 'New',
    status: 'Rejected',
    remarks: 'Incomplete documents',
  },
]

export const mockApplicants = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@example.com',
    type: 'New',
    status: 'Pending',
    submittedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jose Reyes',
    email: 'jose@example.com',
    type: 'Renewal',
    status: 'Approved',
    submittedDate: '2024-02-20',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    email: 'ana@example.com',
    type: 'New',
    status: 'Pending',
    submittedDate: '2024-03-10',
  },
]

export const mockBlockchainRecords = [
  {
    id: '1',
    transactionHash: '0x1231a2b33c4d5e66f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    timestamp: '2024-01-15 10:30:00',
    applicantName: 'Maria Santos',
    status: 'Verified',
    blockNumber: '12345',
  },
  {
    id: '2',
    transactionHash: '0x9b8c7d6e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    timestamp: '2024-02-20 14:45:00',
    applicantName: 'Jose Reyes',
    status: 'Verified',
    blockNumber: '12346',
  },
]

export const mockChartData = [
  { month: 'Jan', applications: 12 },
  { month: 'Feb', applications: 19 },
  { month: 'Mar', applications: 15 },
  { month: 'Apr', applications: 25 },
  { month: 'May', applications: 22 },
  { month: 'Jun', applications: 30 },
]

export const mockEligibleScholars = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@example.com',
    school: 'University of the Philippines',
    course: 'Computer Science',
    yearLevel: '3rd Year',
    gwa: '1.25',
    scholarshipType: 'Academic Excellence',
    amount: 25000,
    status: 'Active',
    awardDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jose Reyes',
    email: 'jose@example.com',
    school: 'Ateneo de Manila University',
    course: 'Business Administration',
    yearLevel: '2nd Year',
    gwa: '1.50',
    scholarshipType: 'Financial Assistance',
    amount: 20000,
    status: 'Active',
    awardDate: '2024-02-20',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    email: 'ana@example.com',
    school: 'De La Salle University',
    course: 'Engineering',
    yearLevel: '1st Year',
    gwa: '1.75',
    scholarshipType: 'Sports Scholarship',
    amount: 15000,
    status: 'Pending',
    awardDate: '2024-03-10',
  },
]
