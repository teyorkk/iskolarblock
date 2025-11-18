import { useState } from "react";
import { useDropzone, type DropzoneRootProps, type DropzoneInputProps } from "react-dropzone";
import { useFileConfirmation, type FileType } from "./use-file-confirmation";
import type {
  COGExtractionResponse,
  CORExtractionResponse,
} from "@/lib/services/document-extraction";

interface UseApplicationFileUploadsOptions {
  onIdFileConfirmed?: (file: File) => void;
  onCogFileConfirmed?: (file: File) => void;
  onCorFileConfirmed?: (file: File) => void;
}

export function useApplicationFileUploads(
  options?: UseApplicationFileUploadsOptions
) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isIdProcessingDone, setIsIdProcessingDone] = useState<boolean>(false);
  const [processedIdFile, setProcessedIdFile] = useState<string>("");
  const [certificateOfGrades, setCertificateOfGrades] = useState<File | null>(null);
  const [isCogProcessingDone, setIsCogProcessingDone] = useState<boolean>(false);
  const [certificateOfRegistration, setCertificateOfRegistration] = useState<File | null>(null);
  const [isCorProcessingDone, setIsCorProcessingDone] = useState<boolean>(false);
  const [processedCogFile, setProcessedCogFile] = useState<string>("");
  const [processedCorFile, setProcessedCorFile] = useState<string>("");

  // Track OCR data and images for submission
  const [idOcrText, setIdOcrText] = useState<string>("");
  const [cogOcrText, setCogOcrText] = useState<string>("");
  const [cogExtractedData, setCogExtractedData] = useState<COGExtractionResponse | null>(null);
  const [cogFileUrl, setCogFileUrl] = useState<string>("");
  const [corOcrText, setCorOcrText] = useState<string>("");
  const [corExtractedData, setCorExtractedData] = useState<CORExtractionResponse | null>(null);
  const [corFileUrl, setCorFileUrl] = useState<string>("");

  const fileConfirmation = useFileConfirmation();

  const documentsProcessing =
    (Boolean(certificateOfGrades) && !isCogProcessingDone) ||
    (Boolean(certificateOfRegistration) && !isCorProcessingDone);

  const onDrop = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      fileConfirmation.openConfirmation(acceptedFiles[0], "ID Document");
    }
  };

  const onDropGrades = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      fileConfirmation.openConfirmation(acceptedFiles[0], "Certificate of Grades");
    }
  };

  const onDropRegistration = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      fileConfirmation.openConfirmation(acceptedFiles[0], "Certificate of Registration");
    }
  };

  const handleConfirmUpload = (): void => {
    const confirmedFile = fileConfirmation.handleConfirm();
    if (!confirmedFile) return;

    const fileType = fileConfirmation.currentFileType;

    if (fileType === "ID Document") {
      setUploadedFile(confirmedFile);
      setIsIdProcessingDone(false);
      setProcessedIdFile("");
      options?.onIdFileConfirmed?.(confirmedFile);
    } else if (fileType === "Certificate of Grades") {
      setCertificateOfGrades(confirmedFile);
      setIsCogProcessingDone(false);
      setProcessedCogFile("");
      options?.onCogFileConfirmed?.(confirmedFile);
    } else if (fileType === "Certificate of Registration") {
      setCertificateOfRegistration(confirmedFile);
      setIsCorProcessingDone(false);
      setProcessedCorFile("");
      options?.onCorFileConfirmed?.(confirmedFile);
    }
  };

  const handleCancelUpload = (): void => {
    fileConfirmation.handleCancel();
  };

  const handleRemoveIdFile = (): void => {
    setUploadedFile(null);
    setIsIdProcessingDone(false);
    setProcessedIdFile("");
  };

  const handleRemoveGradesFile = (): void => {
    setCertificateOfGrades(null);
    setIsCogProcessingDone(false);
    setProcessedCogFile("");
  };

  const handleRemoveRegistrationFile = (): void => {
    setCertificateOfRegistration(null);
    setIsCorProcessingDone(false);
    setProcessedCorFile("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getRootPropsGrades,
    getInputProps: getInputPropsGrades,
    isDragActive: isDragActiveGrades,
  } = useDropzone({
    onDrop: onDropGrades,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const {
    getRootProps: getRootPropsRegistration,
    getInputProps: getInputPropsRegistration,
    isDragActive: isDragActiveRegistration,
  } = useDropzone({
    onDrop: onDropRegistration,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return {
    // File states
    uploadedFile,
    certificateOfGrades,
    certificateOfRegistration,
    
    // Processing states
    isIdProcessingDone,
    setIsIdProcessingDone,
    processedIdFile,
    setProcessedIdFile,
    isCogProcessingDone,
    setIsCogProcessingDone,
    processedCogFile,
    setProcessedCogFile,
    isCorProcessingDone,
    setIsCorProcessingDone,
    processedCorFile,
    setProcessedCorFile,
    
    // OCR data
    idOcrText,
    setIdOcrText,
    cogOcrText,
    setCogOcrText,
    cogExtractedData,
    setCogExtractedData,
    cogFileUrl,
    setCogFileUrl,
    corOcrText,
    setCorOcrText,
    corExtractedData,
    setCorExtractedData,
    corFileUrl,
    setCorFileUrl,
    
    // Computed
    documentsProcessing,
    
    // Dropzone props
    getRootProps,
    getInputProps,
    isDragActive,
    getRootPropsGrades,
    getInputPropsGrades,
    isDragActiveGrades,
    getRootPropsRegistration,
    getInputPropsRegistration,
    isDragActiveRegistration,
    
    // Handlers
    handleConfirmUpload,
    handleCancelUpload,
    handleRemoveIdFile,
    handleRemoveGradesFile,
    handleRemoveRegistrationFile,
    
    // File confirmation
    confirmationModalOpen: fileConfirmation.confirmationModalOpen,
    currentFileType: fileConfirmation.currentFileType,
    getPendingFileName: fileConfirmation.getPendingFileName,
  };
}

