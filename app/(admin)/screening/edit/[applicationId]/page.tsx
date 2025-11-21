"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/admin-sidebar";
import { toast } from "sonner";
import {
  capitalizeFormData,
  capitalizeName,
  capitalizeText,
} from "@/lib/utils";

interface PersonalInfo {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  dateOfBirth: string;
  placeOfBirth: string;
  age: string;
  sex: "male" | "female";
  houseNumber: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
  citizenship: string;
  contactNumber: string;
  religion: string;
  course: string;
  yearLevel: string;
}

interface COGData {
  id: string;
  school: string;
  schoolYear: string;
  semester: string;
  course: string;
  name: string;
  gwa: number;
  totalUnits: number;
  subjects: unknown[];
}

interface CORData {
  id: string;
  school: string;
  schoolYear: string;
  semester: string;
  course: string;
  name: string;
  totalUnits: number;
}

interface ApplicationData {
  id: string;
  status: string;
  applicationType: string;
  applicationDetails: {
    personalInfo?: PersonalInfo;
  };
  CertificateOfGrades?: COGData[];
  CertificateOfRegistration?: CORData[];
}

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.applicationId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [application, setApplication] = useState<ApplicationData | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [cogData, setCogData] = useState<COGData | null>(null);
  const [corData, setCorData] = useState<CORData | null>(null);

  useEffect(() => {
    if (applicationId) {
      void fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/applications/${applicationId}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch application");
        router.push("/screening");
        return;
      }

      setApplication(data.application);
      setPersonalInfo(
        data.application.applicationDetails?.personalInfo || null
      );
      setCogData(data.application.CertificateOfGrades?.[0] || null);
      setCorData(data.application.CertificateOfRegistration?.[0] || null);
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("An error occurred while fetching application");
      router.push("/screening");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalInfoChange = (
    field: keyof PersonalInfo,
    value: string
  ) => {
    if (!personalInfo) return;
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const handleCogChange = (field: string, value: string | number) => {
    if (!cogData) return;
    setCogData({ ...cogData, [field]: value });
  };

  const handleCorChange = (field: string, value: string | number) => {
    if (!corData) return;
    setCorData({ ...corData, [field]: value });
  };

  const handleSave = async () => {
    if (!application || !personalInfo) {
      toast.error("Missing required data");
      return;
    }

    setIsSaving(true);
    try {
      // Capitalize form data
      const capitalizedPersonalInfo = capitalizeFormData(
        personalInfo as unknown as Record<string, unknown>
      ) as unknown as PersonalInfo;

      // Update application details
      const updatePromises = [];

      // Update Application
      updatePromises.push(
        fetch(`/api/admin/applications/${applicationId}/edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationDetails: {
              personalInfo: capitalizedPersonalInfo,
            },
          }),
        })
      );

      // Update COG if exists
      if (cogData) {
        const capitalizedCog = {
          cogId: cogData.id,
          school: cogData.school ? capitalizeText(cogData.school) : "",
          semester: cogData.semester ? capitalizeText(cogData.semester) : "",
          course: cogData.course ? capitalizeText(cogData.course) : "",
          name: cogData.name ? capitalizeName(cogData.name) : "",
          schoolYear: cogData.schoolYear || "",
          gwa: cogData.gwa || 0,
          totalUnits: cogData.totalUnits || 0,
          subjects: cogData.subjects || [],
        };
        updatePromises.push(
          fetch(`/api/admin/applications/${applicationId}/edit/cog`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(capitalizedCog),
          })
        );
      }

      // Update COR if exists
      if (corData) {
        const capitalizedCor = {
          corId: corData.id,
          school: corData.school ? capitalizeText(corData.school) : "",
          semester: corData.semester ? capitalizeText(corData.semester) : "",
          course: corData.course ? capitalizeText(corData.course) : "",
          name: corData.name ? capitalizeName(corData.name) : "",
          schoolYear: corData.schoolYear || "",
          totalUnits: corData.totalUnits || 0,
        };
        updatePromises.push(
          fetch(`/api/admin/applications/${applicationId}/edit/cor`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(capitalizedCor),
          })
        );
      }

      const results = await Promise.all(updatePromises);
      const errors = results.filter((r) => !r.ok);

      if (errors.length > 0) {
        toast.error("Some updates failed. Please try again.");
        return;
      }

      toast.success("Application updated successfully");
      router.push("/screening");
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading application...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application || !personalInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <p className="text-red-600">Application not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:ml-64 md:pt-20 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/screening")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Application
                  </h1>
                  <p className="text-sm text-gray-600">
                    Application ID: {applicationId.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="cog">Certificate of Grades</TabsTrigger>
                <TabsTrigger value="cor">
                  Certificate of Registration
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Edit applicant personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={personalInfo.lastName || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("lastName", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={personalInfo.firstName || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "firstName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          value={personalInfo.middleName || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "middleName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={personalInfo.dateOfBirth || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="placeOfBirth">Place of Birth</Label>
                        <Input
                          id="placeOfBirth"
                          value={personalInfo.placeOfBirth || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "placeOfBirth",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={personalInfo.age || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("age", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sex">Sex</Label>
                        <select
                          id="sex"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={personalInfo.sex || "male"}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "sex",
                              e.target.value as "male" | "female"
                            )
                          }
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="houseNumber">House Number</Label>
                        <Input
                          id="houseNumber"
                          value={personalInfo.houseNumber || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "houseNumber",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="purok">Purok</Label>
                        <Input
                          id="purok"
                          value={personalInfo.purok || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("purok", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="barangay">Barangay</Label>
                        <Input
                          id="barangay"
                          value={personalInfo.barangay || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("barangay", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="municipality">Municipality</Label>
                        <Input
                          id="municipality"
                          value={personalInfo.municipality || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "municipality",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Input
                          id="province"
                          value={personalInfo.province || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("province", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="citizenship">Citizenship</Label>
                        <Input
                          id="citizenship"
                          value={personalInfo.citizenship || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "citizenship",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          value={personalInfo.contactNumber || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "contactNumber",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="religion">Religion</Label>
                        <Input
                          id="religion"
                          value={personalInfo.religion || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("religion", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="course">Course</Label>
                        <Input
                          id="course"
                          value={personalInfo.course || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange("course", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="yearLevel">Year Level</Label>
                        <Input
                          id="yearLevel"
                          value={personalInfo.yearLevel || ""}
                          onChange={(e) =>
                            handlePersonalInfoChange(
                              "yearLevel",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificate of Grades Tab */}
              <TabsContent value="cog">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate of Grades</CardTitle>
                    <CardDescription>
                      Edit certificate of grades information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cogData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cog-school">School</Label>
                          <Input
                            id="cog-school"
                            value={cogData.school || ""}
                            onChange={(e) =>
                              handleCogChange("school", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-schoolYear">School Year</Label>
                          <Input
                            id="cog-schoolYear"
                            value={cogData.schoolYear || ""}
                            onChange={(e) =>
                              handleCogChange("schoolYear", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-semester">Semester</Label>
                          <Input
                            id="cog-semester"
                            value={cogData.semester || ""}
                            onChange={(e) =>
                              handleCogChange("semester", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-course">Course</Label>
                          <Input
                            id="cog-course"
                            value={cogData.course || ""}
                            onChange={(e) =>
                              handleCogChange("course", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-name">Name</Label>
                          <Input
                            id="cog-name"
                            value={cogData.name || ""}
                            onChange={(e) =>
                              handleCogChange("name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-gwa">GWA</Label>
                          <Input
                            id="cog-gwa"
                            type="number"
                            step="0.01"
                            value={cogData.gwa || 0}
                            onChange={(e) =>
                              handleCogChange(
                                "gwa",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cog-totalUnits">Total Units</Label>
                          <Input
                            id="cog-totalUnits"
                            type="number"
                            value={cogData.totalUnits || 0}
                            onChange={(e) =>
                              handleCogChange(
                                "totalUnits",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No Certificate of Grades data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificate of Registration Tab */}
              <TabsContent value="cor">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate of Registration</CardTitle>
                    <CardDescription>
                      Edit certificate of registration information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {corData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cor-school">School</Label>
                          <Input
                            id="cor-school"
                            value={corData.school || ""}
                            onChange={(e) =>
                              handleCorChange("school", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cor-schoolYear">School Year</Label>
                          <Input
                            id="cor-schoolYear"
                            value={corData.schoolYear || ""}
                            onChange={(e) =>
                              handleCorChange("schoolYear", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cor-semester">Semester</Label>
                          <Input
                            id="cor-semester"
                            value={corData.semester || ""}
                            onChange={(e) =>
                              handleCorChange("semester", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cor-course">Course</Label>
                          <Input
                            id="cor-course"
                            value={corData.course || ""}
                            onChange={(e) =>
                              handleCorChange("course", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cor-name">Name</Label>
                          <Input
                            id="cor-name"
                            value={corData.name || ""}
                            onChange={(e) =>
                              handleCorChange("name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cor-totalUnits">Total Units</Label>
                          <Input
                            id="cor-totalUnits"
                            type="number"
                            value={corData.totalUnits || 0}
                            onChange={(e) =>
                              handleCorChange(
                                "totalUnits",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No Certificate of Registration data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
