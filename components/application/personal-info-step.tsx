"use client";

import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ApplicationStepProps } from "@/types/components";
import type { ApplicationFormData } from "@/lib/validations";

export function PersonalInfoStep({
  register,
  errors,
  setValue,
}: ApplicationStepProps<ApplicationFormData>): React.JSX.Element {
  return (
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
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
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
              <Select onValueChange={(value) => setValue("yearLevel", value)}>
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
                <p className="text-sm text-red-500">
                  {errors.yearLevel.message}
                </p>
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
  );
}
