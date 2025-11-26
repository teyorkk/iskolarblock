export function getDocumentRemarks(hasCog: boolean, hasCor: boolean): string {
  if (hasCog && hasCor) {
    return "Complete documents";
  }

  if (!hasCog && !hasCor) {
    return "No document submitted";
  }

  const missing: string[] = [];
  if (!hasCog) missing.push("Certificate of Grades");
  if (!hasCor) missing.push("Certificate of Registration");

  const missingLabel =
    missing.length === 2 ? `${missing[0]} and ${missing[1]}` : missing[0];

  return `Missing ${missingLabel}`;
}

