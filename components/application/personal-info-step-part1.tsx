"use client";

import { useEffect, useRef, useState } from "react";
import { User, AlertCircle, Loader2, MapPin } from "lucide-react";
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
  watch,
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

  const placeOfBirthValue = watch("placeOfBirth") || "";

  interface PlaceSuggestion {
    name: string;
    displayName?: string;
    type: string;
  }

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [searchValue, setSearchValue] = useState(placeOfBirthValue);

  useEffect(() => {
    setSearchValue(placeOfBirthValue);
  }, [placeOfBirthValue]);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      setSuggestionsError(null);
      try {
        const response = await fetch(
          `/api/places/search?q=${encodeURIComponent(searchValue.trim())}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = (await response.json()) as { places: PlaceSuggestion[] };
        if (isMounted) {
          setSuggestions(data.places);
        }
      } catch (error) {
        const isAbortError =
          error instanceof DOMException && error.name === "AbortError";
        if (isAbortError) {
          return;
        }
        console.error("Places suggestions error:", error);
        if (isMounted) {
          setSuggestionsError(
            "We couldn't load suggestions. You can still type your place manually."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      void fetchSuggestions();
    }, 300);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const placeOfBirthRegister = register("placeOfBirth");

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
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 15)
                  )
                    .toISOString()
                    .split("T")[0]
                }
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
              <div className="relative" ref={suggestionsRef}>
                <Input
                  id="placeOfBirth"
                  name={placeOfBirthRegister.name}
                  ref={placeOfBirthRegister.ref}
                  value={searchValue}
                  placeholder="Start typing to search Philippine places"
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(event) => {
                    placeOfBirthRegister.onChange(event);
                    setSearchValue(event.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onBlur={(event) => {
                    placeOfBirthRegister.onBlur(event);
                  }}
                />
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {isLoadingSuggestions ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading places…
                      </div>
                    ) : suggestionsError ? (
                      <div className="px-3 py-2 text-sm text-red-500">
                        {suggestionsError}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No matches. Continue typing to search other locations.
                      </div>
                    ) : (
                      suggestions.map((place, index) => (
                        <button
                          key={`${place.name}-${index}`}
                          type="button"
                          className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-orange-50"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setValue("placeOfBirth", place.name, {
                              shouldValidate: true,
                            });
                            setSearchValue(place.name);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                          <span>
                            <span className="font-medium">{place.name}</span>
                            {place.displayName &&
                              place.displayName !== place.name && (
                                <span className="block text-xs text-gray-500">
                                  {place.displayName}
                                </span>
                              )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
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
                readOnly
                {...register("age")}
                placeholder="Age auto-calculated"
              />
              <p className="text-xs text-gray-500">
                Age is automatically calculated based on your date of birth.
              </p>
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
                value={watch("sex") ?? undefined}
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
