import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentStatusAlertProps {
  bothFilesUploaded: boolean;
  bothProcessingDone: boolean;
  hasErrors: boolean;
  missingDocuments: boolean;
}

export function DocumentStatusAlert({
  bothFilesUploaded,
  bothProcessingDone,
  hasErrors,
  missingDocuments,
}: DocumentStatusAlertProps) {
  if (bothFilesUploaded && !bothProcessingDone) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Processing Documents</AlertTitle>
        <AlertDescription>
          Please wait while we extract and verify your documents...
        </AlertDescription>
      </Alert>
    );
  }

  if (bothFilesUploaded && bothProcessingDone && !hasErrors) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Documents Verified</AlertTitle>
        <AlertDescription className="text-green-600">
          Both documents have been successfully processed.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasErrors) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Processing Errors</AlertTitle>
        <AlertDescription>
          Some documents encountered errors during processing. You can still
          proceed, but please verify your information.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasErrors && missingDocuments) {
    return (
      <Alert className="border-blue-200 bg-blue-50 text-blue-700">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Submit now, finish later</AlertTitle>
        <AlertDescription>
          You may submit even if one document is missing. Your application stays
          in Pending until both COG and COR are uploaded.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

