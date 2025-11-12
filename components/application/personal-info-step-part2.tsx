"use client";

import { Home, GraduationCap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStepProps } from "@/types/components";
import type { NewApplicationFormData } from "@/lib/validations";

export function PersonalInfoStepPart2({
  register,
  errors,
  setValue,
}: ApplicationStepProps<NewApplicationFormData>): React.JSX.Element {
  const step2Errors = ["houseNumber", "purok", "barangay", "municipality", "province", "citizenship", "contactNumber", "religion", "course", "yearLevel"];
  const relevantErrors = step2Errors.filter(field => errors[field as keyof typeof errors]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="w-5 h-5 mr-2 text-orange-500" />
          Address & Academic Information (Part 2)
        </CardTitle>
        <CardDescription>
          Enter your residential address and academic details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {relevantErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix {relevantErrors.length} error{relevantErrors.length > 1 ? 's' : ''} before proceeding.
            </AlertDescription>
          </Alert>
        )}
        <form className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Residential Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number</Label>
                <Input
                  id="houseNumber"
                  {...register("houseNumber")}
                  placeholder="Enter house number"
                />
                {errors.houseNumber && (
                  <p className="text-sm text-red-500">{errors.houseNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purok">Purok</Label>
                <Input
                  id="purok"
                  {...register("purok")}
                  placeholder="Enter purok"
                />
                {errors.purok && (
                  <p className="text-sm text-red-500">{errors.purok.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input
                  id="barangay"
                  {...register("barangay")}
                  placeholder="Enter barangay"
                />
                {errors.barangay && (
                  <p className="text-sm text-red-500">{errors.barangay.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality">Municipality</Label>
                <Input
                  id="municipality"
                  {...register("municipality")}
                  placeholder="Enter municipality"
                />
                {errors.municipality && (
                  <p className="text-sm text-red-500">{errors.municipality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  {...register("province")}
                  value="Bulacan"
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizenship">Citizenship</Label>
                <Input
                  id="citizenship"
                  {...register("citizenship")}
                  value="Filipino"
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Contact & Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  {...register("contactNumber")}
                  placeholder="Enter contact number"
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  {...register("religion")}
                  placeholder="Enter religion"
                />
                {errors.religion && (
                  <p className="text-sm text-red-500">{errors.religion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course/Strand</Label>
                <Input
                  id="course"
                  {...register("course")}
                  placeholder="Enter course or strand"
                />
                {errors.course && (
                  <p className="text-sm text-red-500">{errors.course.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("yearLevel", value as NewApplicationFormData["yearLevel"])
                  }
                >
                  <SelectTrigger>
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
        </form>
      </CardContent>
    </Card>
  );
}
