"use client";

import { Gps, Camera } from "@phosphor-icons/react";
import { useAtomValue } from "jotai";
import NImage from "next/image";
import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { DialogClose } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { userPositionAtom } from "./user-position";
import spacetime from "spacetime";

const compressAndConvertToWebP = (
  imageData: string,
  quality = 0.8,
  maxWidth = 1920,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/webp",
        quality,
      );
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = imageData;
  });
};

export const SubmitSighting = ({
  location,
  url,
  distance,
  createdAt,
}: {
  location?: string;
  url?: string;
  distance?: number;
  createdAt?: Date;
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const position = useAtomValue(userPositionAtom);

  const submitAurora = api.aurora.submit.useMutation();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleSubmit = async () => {
    if (capturedImage) {
      try {
        const compressedBlob = await compressAndConvertToWebP(capturedImage);
        const formData = new FormData();
        formData.append("image", compressedBlob);
        formData.append("location", location);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as { id: string };

        submitAurora.mutate({
          imageId: data.id,
          latitude: position?.coords.latitude ?? 0,
          longitude: position?.coords.longitude ?? 0,
          location,
        });

        if (response.ok) {
          console.log("Aurora moment submitted successfully");
        } else {
          console.error("Failed to submit aurora moment");
        }
      } catch (error) {
        console.error("Submission failed:", error);
      }
    }
  };

  return (
    <>
      {!url && <h2 className="text-xl">Capture Aurora Moment</h2>}
      <label className="-mb-2 text-sm text-muted">Location</label>
      <div className="relative">
        <Gps
          size={24}
          weight="duotone"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <Input value={location} className="pl-10" disabled />
      </div>
      <div className="relative mb-2 h-64 overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              className="h-full w-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width="1280"
              height="720"
            />
            <Button onClick={startCamera} className="absolute bottom-4 left-4">
              Start Camera
            </Button>
            <Button
              onClick={captureImage}
              className="absolute bottom-4 right-4"
            >
              <Camera size={24} weight="duotone" />
              Capture
            </Button>
          </>
        ) : (
          <NImage
            src={capturedImage}
            alt="Aurora preview"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        )}
        {createdAt && (
          <div className="absolute bottom-0 left-0 flex w-full items-center gap-2 bg-gradient-to-b from-transparent to-input p-3">
            <div className="flex items-center gap-2 text-sm">
              <span>{spacetime(createdAt).fromNow(new Date()).qualified}</span>
              {distance && (
                <>
                  <span>•</span>
                  <span>{distance} km away</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {!url && (
        <DialogClose className="w-full" disabled={!capturedImage}>
          <Button
            className="w-full rounded-full"
            disabled={!capturedImage}
            onClick={handleSubmit}
          >
            Submit sighting
          </Button>
        </DialogClose>
      )}
    </>
  );
};
