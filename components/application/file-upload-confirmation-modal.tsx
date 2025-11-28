import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText } from "lucide-react";

interface FileUploadConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  fileName: string;
  fileType:
    | "ID Document"
    | "Certificate of Grades"
    | "Certificate of Registration";
}

export function FileUploadConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  fileName,
  fileType,
}: FileUploadConfirmationModalProps): React.JSX.Element {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Confirm File Upload
          </AlertDialogTitle>
          <div className="space-y-3 pt-2">
            <AlertDialogDescription>
              You are about to upload the following file:
            </AlertDialogDescription>
            <div className="bg-gray-50 p-3 rounded-md border">
              <p className="text-sm font-medium text-gray-900">{fileName}</p>
              <p className="text-xs text-gray-500 mt-1">
                Document Type: {fileType}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This file will be processed and scanned automatically. Do you want
              to proceed?
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm & Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
