"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApplicationStepProps } from "@/types/components";
import type {
  NewApplicationFormData,
  RenewalApplicationFormData,
} from "@/lib/validations";
import { toast } from "sonner";

type FaceForm = NewApplicationFormData | RenewalApplicationFormData;

interface FaceScanStepProps<T extends FaceForm>
  extends ApplicationStepProps<T> {
  uploadedIdFile: File | null;
  onVerificationComplete?: (verified: boolean) => void;
  onFaceScanImageChange?: (image: string) => void;
}

// Global flag to track if models are loaded (persists across component re-mounts)
let globalModelsLoaded = false;
let modelsLoadingPromise: Promise<void> | null = null;

// Load models once globally
async function loadFaceApiModels(): Promise<void> {
  if (globalModelsLoaded) {
    return Promise.resolve();
  }

  if (modelsLoadingPromise) {
    return modelsLoadingPromise;
  }

  modelsLoadingPromise = (async () => {
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      globalModelsLoaded = true;
      console.log("Face-api.js models loaded successfully");
    } catch (error) {
      console.error("Error loading models:", error);
      modelsLoadingPromise = null;
      throw error;
    }
  })();

  return modelsLoadingPromise;
}

// Store face scan results globally to persist across step navigation
interface FaceScanResult {
  capturedImage: string;
  matchResult: {
    distance: number;
    isMatch: boolean;
  };
}

let globalFaceScanResult: FaceScanResult | null = null;

export function FaceScanStep<T extends FaceForm>({
  uploadedIdFile,
  onVerificationComplete,
  onFaceScanImageChange,
}: FaceScanStepProps<T>): React.JSX.Element {
  const [modelsLoaded, setModelsLoaded] = useState(globalModelsLoaded);
  const [idImageUrl, setIdImageUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    globalFaceScanResult?.capturedImage || null
  );
  const [matchResult, setMatchResult] = useState<{
    distance: number;
    isMatch: boolean;
  } | null>(globalFaceScanResult?.matchResult || null);

  // Notify parent of restored state on mount
  useEffect(() => {
    if (globalFaceScanResult) {
      // Notify parent of captured image
      if (onFaceScanImageChange && globalFaceScanResult.capturedImage) {
        onFaceScanImageChange(globalFaceScanResult.capturedImage);
      }

      // Notify parent of verification result
      if (onVerificationComplete && globalFaceScanResult.matchResult) {
        onVerificationComplete(globalFaceScanResult.matchResult.isMatch);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - state is already initialized from global

  const [loading, setLoading] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api.js models only if not already loaded
  useEffect(() => {
    const initModels = async () => {
      // Check global flag first to avoid reloading
      if (globalModelsLoaded) {
        setModelsLoaded(true);
        return;
      }

      try {
        await loadFaceApiModels();
        setModelsLoaded(true);
      } catch {
        toast.error("Failed to load face detection models");
      }
    };

    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        console.warn("Camera API not supported in this browser");
      }
    };

    // Only load if not already loaded globally
    if (!globalModelsLoaded) {
      initModels();
    } else {
      setModelsLoaded(true);
    }

    checkCameraSupport();
  }, []);

  // Load ID image when file is uploaded
  useEffect(() => {
    if (uploadedIdFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(uploadedIdFile);
    } else {
      setIdImageUrl(null);
    }
  }, [uploadedIdFile]);

  // Effect to handle video element when it's rendered
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      console.log("Setting stream to video element in useEffect");
      videoRef.current.srcObject = streamRef.current;

      const playAndStartCountdown = async () => {
        if (videoRef.current) {
          try {
            await videoRef.current.play();
            console.log("Video playing in useEffect");

            setTimeout(() => {
              console.log("Starting countdown from useEffect");
              startCountdown();
            }, 1000);
          } catch (err) {
            console.error("Play error in useEffect:", err);
          }
        }
      };

      playAndStartCountdown();
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser does not support camera access");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      console.log("Camera access granted", stream);
      streamRef.current = stream;
      setCameraActive(true);
      setMatchResult(null);
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Could not access camera. ";

      if (
        error instanceof DOMException ||
        (error instanceof Error && "name" in error)
      ) {
        const errorName =
          error instanceof DOMException
            ? error.name
            : (error as Error & { name: string }).name;
        if (errorName === "NotAllowedError") {
          errorMessage += "Please grant camera permission.";
        } else if (errorName === "NotFoundError") {
          errorMessage += "No camera found.";
        } else if (errorName === "NotReadableError") {
          errorMessage += "Camera is in use by another application.";
        } else {
          errorMessage +=
            error instanceof Error ? error.message : String(error);
        }
      } else {
        errorMessage += error instanceof Error ? error.message : String(error);
      }

      toast.error(errorMessage);
    }
  };

  const startCountdown = () => {
    let count = 5;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(interval);
        captureImage();
      }
    }, 1000);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        onFaceScanImageChange?.(imageData);
        stopCamera();
        setCountdown(null);

        // Auto-match after capture
        setTimeout(() => {
          matchFaces(imageData);
        }, 500);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const matchFaces = async (faceImageData?: string) => {
    const faceImage = faceImageData || capturedImage;

    if (!idImageUrl || !faceImage || !modelsLoaded) {
      toast.error("Please ensure ID is uploaded and face is captured");
      return;
    }

    setLoading(true);
    setMatchResult(null);

    try {
      const img1 = await faceapi.fetchImage(idImageUrl);
      const img2 = await faceapi.fetchImage(faceImage);

      const detection1 = await faceapi
        .detectSingleFace(img1)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const detection2 = await faceapi
        .detectSingleFace(img2)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection1 || !detection2) {
        // Set matchResult to show NOT MATCHED alert
        const failedResult = {
          distance: 999,
          isMatch: false,
        };
        setMatchResult(failedResult);

        // Save to global state
        if (faceImage) {
          globalFaceScanResult = {
            capturedImage: faceImage,
            matchResult: failedResult,
          };
        }

        // Notify parent
        if (onVerificationComplete) {
          onVerificationComplete(false);
        }

        toast.error("Could not detect faces. Please try again.");
        setLoading(false);
        return;
      }

      const distance = faceapi.euclideanDistance(
        detection1.descriptor,
        detection2.descriptor
      );

      const isMatch = distance < 0.6;

      const result = {
        distance,
        isMatch,
      };

      setMatchResult(result);

      // Save to global state to persist across navigation
      if (faceImage) {
        globalFaceScanResult = {
          capturedImage: faceImage,
          matchResult: result,
        };
      }

      // Notify parent component about verification status
      if (onVerificationComplete) {
        onVerificationComplete(isMatch);
      }

      if (isMatch) {
        toast.success("Face verification successful!");
      } else {
        toast.error("Not Matched - Face does not match ID. Please try again.");
      }
    } catch (error) {
      console.error("Error matching faces:", error);
      // Set error result so user sees feedback
      setMatchResult({
        distance: 999,
        isMatch: false,
      });
      toast.error("Error during face matching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setMatchResult(null);
    // Clear global state when user retakes
    globalFaceScanResult = null;
    // Reset verification status
    if (onVerificationComplete) {
      onVerificationComplete(false);
    }
    startCamera();
  };

  if (!modelsLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Face Scan Verification
          </CardTitle>
          <CardDescription>Loading face detection models...</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Please wait...</p>
        </CardContent>
      </Card>
    );
  }

  if (!uploadedIdFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Face Scan Verification
          </CardTitle>
          <CardDescription>
            Position your face in the frame for identity verification
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            Please upload your ID document first before proceeding with face
            verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="w-5 h-5 mr-2 text-orange-500" />
          Face Scan Verification
        </CardTitle>
        <CardDescription>
          Position your face in the frame. Photo will be captured automatically
          after 5 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Camera/Captured Image Display */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black relative mb-4">
          {!cameraActive && !capturedImage ? (
            <div className="aspect-video flex items-center justify-center bg-gray-100">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          ) : cameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto bg-black"
                style={{ minHeight: "300px" }}
              />
              {/* Countdown */}
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="text-white text-8xl font-bold animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <img
              src={capturedImage || ""}
              alt="Captured face"
              className="w-full h-auto"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!capturedImage ? (
            <Button
              onClick={cameraActive ? stopCamera : startCamera}
              className="w-full"
              disabled={!modelsLoaded || !cameraSupported || loading}
              variant={cameraActive ? "destructive" : "default"}
            >
              <Camera className="w-4 h-4 mr-2" />
              {cameraActive ? "Cancel" : "Start Camera"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={retake} variant="outline" className="flex-1">
                Retake Photo
              </Button>
              {!matchResult && (
                <Button
                  onClick={() => matchFaces()}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Face"}
                </Button>
              )}
            </div>
          )}

          {!cameraSupported && (
            <p className="text-sm text-red-600 text-center">
              Camera not supported. Please use HTTPS or a compatible browser.
            </p>
          )}
        </div>

        {/* Match Result Display */}
        {matchResult && (
          <div
            className={`mt-4 p-4 rounded-lg text-center ${
              matchResult.isMatch
                ? "bg-green-100 border-2 border-green-500"
                : "bg-red-100 border-2 border-red-500"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {matchResult.isMatch ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <h3
                className={`text-xl font-bold ${
                  matchResult.isMatch ? "text-green-800" : "text-red-800"
                }`}
              >
                {matchResult.isMatch ? "VERIFIED " : "NOT MATCHED"}
              </h3>
            </div>
            <p className="text-sm text-gray-700 mt-1 font-medium">
              {matchResult.isMatch
                ? "Your face matches the ID photo. You can now proceed."
                : "Your face does not match the ID photo. Please try again."}
            </p>
            {!matchResult.isMatch && (
              <p className="text-xs text-red-700 mt-2">
                Please retake the photo and try again.
              </p>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
