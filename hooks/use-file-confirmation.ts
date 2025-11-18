import { useState } from "react";

export type FileType =
  | "ID Document"
  | "Certificate of Grades"
  | "Certificate of Registration";

export function useFileConfirmation() {
  const [pendingIdFile, setPendingIdFile] = useState<File | null>(null);
  const [pendingCogFile, setPendingCogFile] = useState<File | null>(null);
  const [pendingCorFile, setPendingCorFile] = useState<File | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [currentFileType, setCurrentFileType] = useState<FileType>("ID Document");

  const openConfirmation = (file: File, type: FileType) => {
    if (type === "ID Document") {
      setPendingIdFile(file);
    } else if (type === "Certificate of Grades") {
      setPendingCogFile(file);
    } else if (type === "Certificate of Registration") {
      setPendingCorFile(file);
    }
    setCurrentFileType(type);
    setConfirmationModalOpen(true);
  };

  const handleConfirm = (): File | null => {
    let confirmedFile: File | null = null;

    if (pendingIdFile) {
      confirmedFile = pendingIdFile;
      setPendingIdFile(null);
    } else if (pendingCogFile) {
      confirmedFile = pendingCogFile;
      setPendingCogFile(null);
    } else if (pendingCorFile) {
      confirmedFile = pendingCorFile;
      setPendingCorFile(null);
    }

    setConfirmationModalOpen(false);
    return confirmedFile;
  };

  const handleCancel = () => {
    setPendingIdFile(null);
    setPendingCogFile(null);
    setPendingCorFile(null);
    setConfirmationModalOpen(false);
  };

  const getPendingFileName = () => {
    return pendingIdFile?.name || pendingCogFile?.name || pendingCorFile?.name || "";
  };

  return {
    pendingIdFile,
    pendingCogFile,
    pendingCorFile,
    confirmationModalOpen,
    currentFileType,
    openConfirmation,
    handleConfirm,
    handleCancel,
    getPendingFileName,
  };
}

