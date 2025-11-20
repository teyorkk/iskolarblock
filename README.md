# IskolarBlock: Blockchain-Based Scholarship Management System

## Project Overview

**IskolarBlock** is a comprehensive web-based scholarship management system developed as a capstone project. The system is designed to facilitate and streamline the scholarship application, screening, and awarding processes for the Municipality of San Miguel, Hagonoy, Bulacan. The platform integrates blockchain technology to ensure transparency, immutability, and verifiability of scholarship records and transactions.

## Project Information

- **Project Type**: Capstone Project
- **Target Institution**: Municipality of San Miguel, Hagonoy, Bulacan
- **Purpose**: Digital transformation of scholarship management processes
- **Technology**: Next.js, TypeScript, Supabase, Blockchain Integration

## Background and Context

The Municipality of San Miguel, Hagonoy, Bulacan, recognizes the importance of providing educational support to its constituents through scholarship programs. Traditional paper-based and manual processes for managing scholarship applications have presented challenges in terms of efficiency, transparency, and record-keeping. This project addresses these challenges by implementing a digital solution that automates the scholarship lifecycle while ensuring data integrity through blockchain technology.

## Objectives

The primary objectives of this capstone project are:

1. **Digitalization**: Transform manual scholarship management processes into a fully digital platform
2. **Transparency**: Implement blockchain technology to create an immutable audit trail of all scholarship-related transactions
3. **Efficiency**: Streamline application submission, screening, and awarding processes
4. **Accessibility**: Provide a user-friendly interface for both applicants and administrators
5. **Data Integrity**: Ensure the security and verifiability of scholarship records through blockchain integration

## Key Features

### For Applicants (Scholars)

- **Application Management**: Submit new scholarship applications or renew existing ones
- **Document Upload**: Secure upload of required documents (ID, Certificate of Grades, Certificate of Registration)
- **OCR Processing**: Automated extraction of data from uploaded documents
- **Application Tracking**: Real-time status updates on application progress
- **Application History**: View past applications and their statuses

### For Administrators

- **Application Screening**: Comprehensive interface for reviewing and processing applications
- **Status Management**: Update application statuses (Pending, Approved, Rejected, Granted)
- **Awarding System**: Manage scholarship awarding and disbursement processes
- **User Management**: Administer user accounts and roles
- **Analytics Dashboard**: View statistics and trends related to scholarship programs
- **Blockchain Records**: Access and verify blockchain-verified transaction records

### Technical Features

- **Blockchain Integration**: All critical transactions are logged to the blockchain for transparency
- **Document Processing**: OCR (Optical Character Recognition) for automated data extraction
- **Role-Based Access Control**: Secure access management for different user types
- **Real-time Updates**: Live statistics and application status tracking
- **Responsive Design**: Mobile-friendly interface for accessibility

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API Routes**: Next.js API Routes

### Blockchain

- **Network**: Polygon (Amoy Testnet)
- **Explorer**: OKLink Blockchain Explorer
- **Integration**: Custom blockchain logging service

### Development Tools

- **Package Manager**: npm/yarn/pnpm
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git

## Installation and Setup

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager
- Git
- Supabase account and project
- Blockchain wallet (for blockchain integration)

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd scholarblock
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL=your_blockchain_explorer_url
   # Add other required environment variables
   ```

4. **Database Setup**

   Execute the database schema and migrations in your Supabase project. Refer to the database documentation for schema details.

5. **Run Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Access the Application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
scholarblock/
├── app/                          # Next.js app directory
│   ├── (admin)/                  # Admin routes
│   │   ├── admin-dashboard/      # Admin dashboard
│   │   ├── screening/            # Application screening
│   │   ├── awarding/             # Scholarship awarding
│   │   ├── blockchain/           # Blockchain records
│   │   └── users/                # User management
│   ├── (user)/                   # User routes
│   │   ├── application/          # Application pages
│   │   ├── user-dashboard/       # User dashboard
│   │   └── history/              # Application history
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── forgot-password/      # Password recovery
│   ├── api/                      # API routes
│   │   ├── applications/         # Application APIs
│   │   ├── admin/                # Admin APIs
│   │   ├── auth/                 # Authentication APIs
│   │   └── extract/              # OCR extraction APIs
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── admin-awarding/          # Awarding components
│   ├── admin-screening/          # Screening components
│   ├── application/              # Application components
│   ├── blockchain/               # Blockchain components
│   ├── common/                   # Shared components
│   └── ui/                       # UI component library
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   └── validations/              # Form validation schemas
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

## Usage

### For Applicants

1. **Registration**: Create an account through the registration page
2. **Login**: Access your account using your credentials
3. **Application Submission**:
   - Navigate to the application section
   - Choose between "New Application" or "Renewal Application"
   - Complete the multi-step application form
   - Upload required documents
   - Submit the application
4. **Track Status**: Monitor your application status through the dashboard
5. **View History**: Access past applications in the history section

### For Administrators

1. **Login**: Access the admin dashboard with administrator credentials
2. **Application Screening**:
   - Review submitted applications
   - Update application statuses
   - View applicant details and documents
3. **Awarding Management**:
   - Process approved applications
   - Grant scholarships
   - Track disbursements
4. **Analytics**: View dashboard statistics and trends
5. **Blockchain Verification**: Access and verify blockchain records

## System Architecture

The system follows a modern three-tier architecture:

1. **Presentation Layer**: Next.js frontend with React components
2. **Application Layer**: Next.js API routes and business logic services
3. **Data Layer**: Supabase (PostgreSQL database and file storage)

Blockchain integration operates as a parallel verification layer, logging critical transactions to ensure data integrity and transparency.

## Security Considerations

- **Authentication**: Secure user authentication through Supabase Auth
- **Authorization**: Role-based access control (RBAC) for different user types
- **Data Validation**: Input validation using Zod schemas
- **File Upload Security**: Secure document storage with access controls
- **Blockchain Verification**: Immutable transaction records for audit purposes

## Future Enhancements

Potential areas for future development include:

- Enhanced reporting and analytics features
- Integration with payment gateways for disbursement automation
- Mobile application development
- Advanced document verification using AI/ML
- Multi-language support
- Notification system for application updates

## Contributing

This is a capstone project developed for academic purposes. For questions or inquiries regarding the project, please contact the development team.

## License

This project is developed as part of a capstone project for academic purposes. All rights reserved.

## Acknowledgments

- **Institution**: Municipality of San Miguel, Hagonoy, Bulacan
- **Technology Providers**:
  - Next.js and Vercel
  - Supabase
  - Polygon Network
- **Open Source Libraries**: All contributors to the open-source libraries used in this project

## Contact Information

For project-related inquiries, please contact the development team through the appropriate academic channels.

---

**Note**: This project is developed as part of a capstone requirement and is intended for academic and demonstration purposes. The system is designed to showcase the integration of modern web technologies with blockchain for transparent and efficient scholarship management.
