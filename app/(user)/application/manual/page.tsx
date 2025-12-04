"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, FileText, User, Home, Plus, Trash2, IdCard, BookOpen } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Subject type for COG
type Subject = {
  id: string;
  description: string;
  units: number;
  grade: number;
};

type GradingSystem = "shs" | "college";

// Validation schema
const manualApplicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  age: z.string().optional(),
  sex: z.enum(["male", "female"], { message: "Sex is required" }),

  // Address & Contact
  houseNumber: z.string().min(1, "House number is required"),
  purok: z.string().min(1, "Purok/Street is required"),
  barangay: z.string().min(1, "Barangay is required"),
  municipality: z.string().min(1, "Municipality is required"),
  province: z.string().min(1, "Province is required"),
  citizenship: z.string().min(1, "Citizenship is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  religion: z.string().min(1, "Religion is required"),

  // Academic Information
  course: z.string().min(1, "Course/Strand is required"),
  yearLevel: z.enum(["G11", "G12", "1", "2", "3", "4"], {
    message: "Year level is required",
  }),

  // COR Information
  corSchool: z.string().optional(),
  corSchoolYear: z.string().optional(),
  corSemester: z.string().optional(),
  corCourse: z.string().optional(),
  corName: z.string().optional(),
  corTotalUnits: z.string().optional(),

  // COG Information
  cogSchool: z.string().optional(),
  cogSchoolYear: z.string().optional(),
  cogSemester: z.string().optional(),
  cogCourse: z.string().optional(),
  cogName: z.string().optional(),
});

type ManualApplicationForm = z.infer<typeof manualApplicationSchema>;

export default function ManualApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    id?: File;
    cor?: File;
    cog?: File;
  }>({});

  // COG Subjects State
  const [cogSubjects, setCogSubjects] = useState<Subject[]>([
    { id: "1", description: "", units: 0, grade: 0 },
  ]);
  
  // Grading system state
  const [gradingSystem, setGradingSystem] = useState<GradingSystem>("college");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ManualApplicationForm>({
    resolver: zodResolver(manualApplicationSchema),
    defaultValues: {
      barangay: "San Miguel",
      municipality: "Hagonoy",
      province: "Bulacan",
      citizenship: "Filipino",
    },
  });

  const sex = watch("sex");
  const yearLevel = watch("yearLevel");

  // Calculate GWA and Total Units for COG
  const calculateCogStats = () => {
    const totalUnits = cogSubjects.reduce((sum, subject) => sum + (subject.units || 0), 0);
    
    if (gradingSystem === "shs") {
      // For SHS: Simple average of grades (60-99 scale)
      const totalGrades = cogSubjects.reduce((sum, subject) => sum + (subject.grade || 0), 0);
      const gwa = cogSubjects.length > 0 ? (totalGrades / cogSubjects.length).toFixed(2) : "0.00";
      return { totalUnits, gwa };
    } else {
      // For College: Weighted average (1.0-5.0 scale)
      const weightedGrades = cogSubjects.reduce((sum, subject) => {
        return sum + (subject.grade || 0) * (subject.units || 0);
      }, 0);
      const gwa = totalUnits > 0 ? (weightedGrades / totalUnits).toFixed(2) : "0.00";
      return { totalUnits, gwa };
    }
  };

  const { totalUnits: cogTotalUnits, gwa: cogGwa } = calculateCogStats();

  // Add Subject
  const addSubject = () => {
    setCogSubjects([
      ...cogSubjects,
      { id: Date.now().toString(), description: "", units: 0, grade: 0 },
    ]);
  };

  // Remove Subject
  const removeSubject = (id: string) => {
    if (cogSubjects.length > 1) {
      setCogSubjects(cogSubjects.filter((subject) => subject.id !== id));
    }
  };

  // Update Subject
  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setCogSubjects(
      cogSubjects.map((subject) =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    );
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "id" | "cor" | "cog"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPG, PNG, or PDF files only.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB.");
        return;
      }

      setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
      toast.success(`${fileType.toUpperCase()} uploaded successfully`);
    }
  };

  const onSubmit = async (data: ManualApplicationForm) => {
    try {
      setIsSubmitting(true);

      const supabase = getSupabaseBrowserClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("You must be logged in to submit an application");
        router.push("/login");
        return;
      }

      // Get active application period
      const { data: activePeriod, error: periodError } = await supabase
        .from("ApplicationPeriod")
        .select("id")
        .lte("startDate", new Date().toISOString())
        .gte("endDate", new Date().toISOString())
        .single();

      if (periodError || !activePeriod) {
        toast.error("No active application period found");
        return;
      }

      let idUrl = null;
      let corUrl = null;
      let cogUrl = null;

      // Upload files to Supabase Storage (if provided)
      const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("application-documents")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload ${folder}: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("application-documents").getPublicUrl(filePath);

        return publicUrl;
      };

      if (uploadedFiles.id || uploadedFiles.cor || uploadedFiles.cog) {
        toast.info("Uploading documents...");
        
        if (uploadedFiles.id) {
          idUrl = await uploadFile(uploadedFiles.id, "ids");
        }
        if (uploadedFiles.cor) {
          corUrl = await uploadFile(uploadedFiles.cor, "cors");
        }
        if (uploadedFiles.cog) {
          cogUrl = await uploadFile(uploadedFiles.cog, "cogs");
        }
      }

      // Prepare application data with COR and COG details
      const applicationData = {
        userId: user.id,
        applicationPeriodId: activePeriod.id,
        applicationType: "NEW",
        status: "PENDING",
        applicationDetails: {
          personalInfo: {
            firstName: data.firstName,
            middleName: data.middleName || "",
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            placeOfBirth: data.placeOfBirth,
            age: data.age || "",
            sex: data.sex,
          },
          address: {
            houseNumber: data.houseNumber,
            purok: data.purok,
            barangay: data.barangay,
            municipality: data.municipality,
            province: data.province,
          },
          academicInfo: {
            contactNumber: data.contactNumber,
            citizenship: data.citizenship,
            religion: data.religion,
            course: data.course,
            yearLevel: data.yearLevel,
          },
          documents: {
            idUrl,
            corUrl,
            cogUrl,
          },
          corData: data.corSchool ? {
            school: data.corSchool,
            schoolYear: data.corSchoolYear,
            semester: data.corSemester,
            course: data.corCourse,
            name: data.corName,
            totalUnits: data.corTotalUnits,
          } : null,
          cogData: data.cogSchool ? {
            school: data.cogSchool,
            schoolYear: data.cogSchoolYear,
            semester: data.cogSemester,
            course: data.cogCourse,
            name: data.cogName,
            subjects: cogSubjects,
            totalUnits: cogTotalUnits,
            gwa: cogGwa,
            gradingSystem: gradingSystem,
          } : null,
        },
      };

      // Submit application
      const response = await fetch("/api/applications/manual-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      setTimeout(() => {
        router.push("/application");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-white py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="shadow-xl rounded-2xl border-orange-100">
          <CardHeader className="bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
            <CardTitle className="text-3xl">Manual Application Entry</CardTitle>
            <CardDescription className="text-orange-50">
              Direct application submission with manual data entry
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Document Upload Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Upload className="w-6 h-6 text-orange-600" />
                  Document Uploads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ID Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="id-upload" className="text-sm font-medium flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-orange-600" />
                      Valid ID
                    </Label>
                    <div className="relative">
                      <input
                        id="id-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "id")}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start h-24 rounded-xl border-2 border-dashed hover:border-orange-500 hover:bg-orange-50 transition-all"
                        onClick={() =>
                          document.getElementById("id-upload")?.click()
                        }
                      >
                        {uploadedFiles.id ? (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="text-xs truncate w-full text-center">{uploadedFiles.id.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <IdCard className="w-6 h-6 text-gray-400" />
                            <span className="text-sm">Upload ID</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* COR Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="cor-upload" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      Certificate of Registration
                    </Label>
                    <div className="relative">
                      <input
                        id="cor-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "cor")}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start h-24 rounded-xl border-2 border-dashed hover:border-orange-500 hover:bg-orange-50 transition-all"
                        onClick={() =>
                          document.getElementById("cor-upload")?.click()
                        }
                      >
                        {uploadedFiles.cor ? (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="text-xs truncate w-full text-center">{uploadedFiles.cor.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <FileText className="w-6 h-6 text-gray-400" />
                            <span className="text-sm">Upload COR</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* COG Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="cog-upload" className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      Certificate of Grades
                    </Label>
                    <div className="relative">
                      <input
                        id="cog-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "cog")}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start h-24 rounded-xl border-2 border-dashed hover:border-orange-500 hover:bg-orange-50 transition-all"
                        onClick={() =>
                          document.getElementById("cog-upload")?.click()
                        }
                      >
                        {uploadedFiles.cog ? (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="text-xs truncate w-full text-center">{uploadedFiles.cog.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                            <span className="text-sm">Upload COG</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COR Information Section */}
              <div className="space-y-6 bg-orange-50/30 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-orange-200 pb-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                  Certificate of Registration (COR) Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="corSchool" className="text-sm font-medium">School</Label>
                    <Input
                      id="corSchool"
                      {...register("corSchool")}
                      placeholder="Enter school name"
                      className={`rounded-lg ${errors.corSchool ? "border-red-500" : ""}`}
                    />
                    {errors.corSchool && (
                      <p className="text-sm text-red-500">{errors.corSchool.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corSchoolYear" className="text-sm font-medium">School Year</Label>
                    <Input
                      id="corSchoolYear"
                      {...register("corSchoolYear")}
                      placeholder="e.g., 2024-2025"
                      className={`rounded-lg ${errors.corSchoolYear ? "border-red-500" : ""}`}
                    />
                    {errors.corSchoolYear && (
                      <p className="text-sm text-red-500">{errors.corSchoolYear.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corSemester" className="text-sm font-medium">Semester</Label>
                    <Input
                      id="corSemester"
                      {...register("corSemester")}
                      placeholder="e.g., 1st Semester"
                      className={`rounded-lg ${errors.corSemester ? "border-red-500" : ""}`}
                    />
                    {errors.corSemester && (
                      <p className="text-sm text-red-500">{errors.corSemester.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corCourse" className="text-sm font-medium">Course</Label>
                    <Input
                      id="corCourse"
                      {...register("corCourse")}
                      placeholder="Enter course"
                      className={`rounded-lg ${errors.corCourse ? "border-red-500" : ""}`}
                    />
                    {errors.corCourse && (
                      <p className="text-sm text-red-500">{errors.corCourse.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corName" className="text-sm font-medium">Student Name</Label>
                    <Input
                      id="corName"
                      {...register("corName")}
                      placeholder="Enter student name"
                      className={`rounded-lg ${errors.corName ? "border-red-500" : ""}`}
                    />
                    {errors.corName && (
                      <p className="text-sm text-red-500">{errors.corName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="corTotalUnits" className="text-sm font-medium">Total Units</Label>
                    <Input
                      id="corTotalUnits"
                      {...register("corTotalUnits")}
                      placeholder="Enter total units"
                      type="number"
                      className={`rounded-lg ${errors.corTotalUnits ? "border-red-500" : ""}`}
                    />
                    {errors.corTotalUnits && (
                      <p className="text-sm text-red-500">{errors.corTotalUnits.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* COG Information Section */}
              <div className="space-y-6 bg-blue-50/30 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-blue-200 pb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Certificate of Grades (COG) Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cogSchool" className="text-sm font-medium">School</Label>
                    <Input
                      id="cogSchool"
                      {...register("cogSchool")}
                      placeholder="Enter school name"
                      className={`rounded-lg ${errors.cogSchool ? "border-red-500" : ""}`}
                    />
                    {errors.cogSchool && (
                      <p className="text-sm text-red-500">{errors.cogSchool.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cogSchoolYear" className="text-sm font-medium">School Year</Label>
                    <Input
                      id="cogSchoolYear"
                      {...register("cogSchoolYear")}
                      placeholder="e.g., 2024-2025"
                      className={`rounded-lg ${errors.cogSchoolYear ? "border-red-500" : ""}`}
                    />
                    {errors.cogSchoolYear && (
                      <p className="text-sm text-red-500">{errors.cogSchoolYear.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cogSemester" className="text-sm font-medium">Semester</Label>
                    <Input
                      id="cogSemester"
                      {...register("cogSemester")}
                      placeholder="e.g., 1st Semester"
                      className={`rounded-lg ${errors.cogSemester ? "border-red-500" : ""}`}
                    />
                    {errors.cogSemester && (
                      <p className="text-sm text-red-500">{errors.cogSemester.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cogCourse" className="text-sm font-medium">Course</Label>
                    <Input
                      id="cogCourse"
                      {...register("cogCourse")}
                      placeholder="Enter course"
                      className={`rounded-lg ${errors.cogCourse ? "border-red-500" : ""}`}
                    />
                    {errors.cogCourse && (
                      <p className="text-sm text-red-500">{errors.cogCourse.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cogName" className="text-sm font-medium">Student Name</Label>
                    <Input
                      id="cogName"
                      {...register("cogName")}
                      placeholder="Enter student name"
                      className={`rounded-lg ${errors.cogName ? "border-red-500" : ""}`}
                    />
                    {errors.cogName && (
                      <p className="text-sm text-red-500">{errors.cogName.message}</p>
                    )}
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-md font-semibold">Subjects</Label>
                    <div className="flex items-center gap-3">
                      <Select
                        value={gradingSystem}
                        onValueChange={(val) => setGradingSystem(val as GradingSystem)}
                      >
                        <SelectTrigger className="w-[180px] rounded-lg">
                          <SelectValue placeholder="Grading System" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="college">College (1.0-5.0)</SelectItem>
                          <SelectItem value="shs">SHS (60-99)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addSubject}
                        className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {cogSubjects.map((subject) => (
                      <div key={subject.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white rounded-xl border border-blue-100">
                        <div className="md:col-span-5 space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Subject Description</Label>
                          <Input
                            placeholder="e.g., Mathematics"
                            value={subject.description}
                            onChange={(e) => updateSubject(subject.id, "description", e.target.value)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-medium text-gray-600">Units</Label>
                          <Input
                            type="number"
                            placeholder="3"
                            value={subject.units || ""}
                            onChange={(e) => updateSubject(subject.id, "units", parseFloat(e.target.value) || 0)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            Grade {gradingSystem === "shs" ? "(60-99)" : "(1.0-5.0)"}
                          </Label>
                          <Input
                            type="number"
                            step={gradingSystem === "shs" ? "1" : "0.01"}
                            min={gradingSystem === "shs" ? "60" : "1.0"}
                            max={gradingSystem === "shs" ? "99" : "5.0"}
                            placeholder={gradingSystem === "shs" ? "75" : "1.00"}
                            value={subject.grade || ""}
                            onChange={(e) => updateSubject(subject.id, "grade", parseFloat(e.target.value) || 0)}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="md:col-span-3 flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSubject(subject.id)}
                            disabled={cogSubjects.length === 1}
                            className="w-full rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Auto-computed Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-linear-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-blue-800">Total Units</Label>
                      <div className="text-2xl font-bold text-blue-900">{cogTotalUnits}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-blue-800">
                        GWA {gradingSystem === "shs" ? "(Average)" : "(Weighted Average)"}
                      </Label>
                      <div className="text-2xl font-bold text-blue-900">{cogGwa}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <User className="w-6 h-6 text-orange-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Enter last name"
                      className={`rounded-lg ${errors.lastName ? "border-red-500" : ""}`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="Enter first name"
                      className={`rounded-lg ${errors.firstName ? "border-red-500" : ""}`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-sm font-medium">Middle Name</Label>
                    <Input
                      id="middleName"
                      {...register("middleName")}
                      placeholder="Optional"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      className={`rounded-lg ${errors.dateOfBirth ? "border-red-500" : ""}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placeOfBirth" className="text-sm font-medium">Place of Birth *</Label>
                    <Input
                      id="placeOfBirth"
                      {...register("placeOfBirth")}
                      placeholder="Enter place of birth"
                      className={`rounded-lg ${errors.placeOfBirth ? "border-red-500" : ""}`}
                    />
                    {errors.placeOfBirth && (
                      <p className="text-sm text-red-500">{errors.placeOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      {...register("age")}
                      placeholder="Optional"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-sm font-medium">Sex *</Label>
                    <Select
                      value={sex}
                      onValueChange={(val) => setValue("sex", val as "male" | "female")}
                    >
                      <SelectTrigger className={`rounded-lg ${errors.sex ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sex && (
                      <p className="text-sm text-red-500">{errors.sex.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address & Academic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Home className="w-6 h-6 text-orange-600" />
                  Address & Academic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber" className="text-sm font-medium">House Number *</Label>
                    <Input
                      id="houseNumber"
                      {...register("houseNumber")}
                      placeholder="Enter house number"
                      className={`rounded-lg ${errors.houseNumber ? "border-red-500" : ""}`}
                    />
                    {errors.houseNumber && (
                      <p className="text-sm text-red-500">{errors.houseNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purok" className="text-sm font-medium">Purok/Street *</Label>
                    <Input
                      id="purok"
                      {...register("purok")}
                      placeholder="Enter purok/street"
                      className={`rounded-lg ${errors.purok ? "border-red-500" : ""}`}
                    />
                    {errors.purok && (
                      <p className="text-sm text-red-500">{errors.purok.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barangay" className="text-sm font-medium">Barangay</Label>
                    <Input
                      id="barangay"
                      {...register("barangay")}
                      value="San Miguel"
                      readOnly
                      className="rounded-lg bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipality" className="text-sm font-medium">Municipality</Label>
                    <Input
                      id="municipality"
                      {...register("municipality")}
                      value="Hagonoy"
                      readOnly
                      className="rounded-lg bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-medium">Province</Label>
                    <Input
                      id="province"
                      {...register("province")}
                      value="Bulacan"
                      readOnly
                      className="rounded-lg bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="citizenship" className="text-sm font-medium">Citizenship</Label>
                    <Input
                      id="citizenship"
                      {...register("citizenship")}
                      value="Filipino"
                      readOnly
                      className="rounded-lg bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      {...register("contactNumber")}
                      placeholder="Enter contact number"
                      className={`rounded-lg ${errors.contactNumber ? "border-red-500" : ""}`}
                    />
                    {errors.contactNumber && (
                      <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion" className="text-sm font-medium">Religion *</Label>
                    <Input
                      id="religion"
                      {...register("religion")}
                      placeholder="Enter religion"
                      className={`rounded-lg ${errors.religion ? "border-red-500" : ""}`}
                    />
                    {errors.religion && (
                      <p className="text-sm text-red-500">{errors.religion.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium">Course/Strand *</Label>
                    <Input
                      id="course"
                      {...register("course")}
                      placeholder="Enter course or strand"
                      className={`rounded-lg ${errors.course ? "border-red-500" : ""}`}
                    />
                    {errors.course && (
                      <p className="text-sm text-red-500">{errors.course.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearLevel" className="text-sm font-medium">Year Level *</Label>
                    <Select
                      value={yearLevel}
                      onValueChange={(val) => setValue("yearLevel", val as "G11" | "G12" | "1" | "2" | "3" | "4")}
                    >
                      <SelectTrigger className={`rounded-lg ${errors.yearLevel ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select year level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="G11">Grade 11</SelectItem>
                        <SelectItem value="G12">Grade 12</SelectItem>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.yearLevel && (
                      <p className="text-sm text-red-500">{errors.yearLevel.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
