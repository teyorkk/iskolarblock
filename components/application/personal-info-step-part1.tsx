"use client";

import { User, AlertCircle } from "lucide-react";
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

export function PersonalInfoStepPart1({
  register,
  errors,
  setValue,
}: ApplicationStepProps<NewApplicationFormData>): React.JSX.Element {
  const step1Errors = [
    "lastName",
    "firstName",
    "middleName",
    "dateOfBirth",
    "placeOfBirth",
    "age",
    "sex",
  ];
  const relevantErrors = step1Errors.filter(
    (field) => errors[field as keyof typeof errors]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2 text-orange-500" />
          Personal Information (Part 1)
        </CardTitle>
        <CardDescription>Enter your basic personal details</CardDescription>
      </CardHeader>
      <CardContent>
        {relevantErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix {relevantErrors.length} error
              {relevantErrors.length > 1 ? "s" : ""} before proceeding.
            </AlertDescription>
          </Alert>
        )}
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                {...register("middleName")}
                placeholder="Enter your middle name (optional)"
              />
              {errors.middleName && (
                <p className="text-sm text-red-500">
                  {errors.middleName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (mm/dd/yyyy)</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeOfBirth">Place of Birth</Label>
              <Input
                id="placeOfBirth"
                {...register("placeOfBirth")}
                placeholder="Enter your place of birth"
              />
              {errors.placeOfBirth && (
                <p className="text-sm text-red-500">
                  {errors.placeOfBirth.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                onValueChange={(value) =>
                  setValue("sex", value as NewApplicationFormData["sex"])
                }
              >
                <SelectTrigger>
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
        </form>
      </CardContent>
    </Card>
  );
}
