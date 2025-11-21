import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes text properly for names (Title Case)
 * Handles special cases like "de", "del", "van", "von", etc.
 */
export function capitalizeName(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "";

  const lowercaseWords = [
    "de",
    "del",
    "van",
    "von",
    "la",
    "le",
    "da",
    "dos",
    "das",
    "do",
    "y",
    "e",
  ];

  return name
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      // Don't lowercase first word or words after certain punctuation
      if (index === 0 || !lowercaseWords.includes(lowerWord)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      return lowerWord;
    })
    .join(" ");
}

/**
 * Capitalizes text properly for addresses and general text (Title Case)
 */
export function capitalizeText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  return text
    .trim()
    .split(/\s+/)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Capitalizes application form data before saving to database
 */
export function capitalizeFormData(
  formData: Record<string, unknown>
): Record<string, unknown> {
  const capitalized: Record<string, unknown> = { ...formData };

  // Name fields - use capitalizeName
  if (typeof capitalized.firstName === "string") {
    capitalized.firstName = capitalizeName(capitalized.firstName);
  }
  if (typeof capitalized.lastName === "string") {
    capitalized.lastName = capitalizeName(capitalized.lastName);
  }
  if (typeof capitalized.middleName === "string") {
    capitalized.middleName = capitalizeName(capitalized.middleName);
  }

  // Address fields - use capitalizeText
  if (typeof capitalized.barangay === "string") {
    capitalized.barangay = capitalizeText(capitalized.barangay);
  }
  if (typeof capitalized.municipality === "string") {
    capitalized.municipality = capitalizeText(capitalized.municipality);
  }
  if (typeof capitalized.province === "string") {
    capitalized.province = capitalizeText(capitalized.province);
  }
  if (typeof capitalized.purok === "string") {
    capitalized.purok = capitalizeText(capitalized.purok);
  }
  if (typeof capitalized.placeOfBirth === "string") {
    capitalized.placeOfBirth = capitalizeText(capitalized.placeOfBirth);
  }

  // Course and other text fields
  if (typeof capitalized.course === "string") {
    capitalized.course = capitalizeText(capitalized.course);
  }
  if (typeof capitalized.religion === "string") {
    capitalized.religion = capitalizeText(capitalized.religion);
  }
  if (typeof capitalized.citizenship === "string") {
    capitalized.citizenship = capitalizeText(capitalized.citizenship);
  }

  // Year level - capitalize but keep numbers
  if (typeof capitalized.yearLevel === "string") {
    capitalized.yearLevel = capitalizeText(capitalized.yearLevel);
  }

  return capitalized;
}
