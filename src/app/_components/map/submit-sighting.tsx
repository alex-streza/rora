"use client";

import { Gps, Panorama } from "@phosphor-icons/react";
import { useAtom, useAtomValue } from "jotai";
import NImage from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DialogClose } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { userPositionAtom } from "./user-position";

const compressAndConvertToWebP = (
  file: File,
  quality = 0.8,
  maxWidth = 1920,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if width is greater than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Check if the browser supports toBlob with type 'image/webp'
        if (canvas.toBlob) {
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
        } else {
          reject(new Error("Browser does not support canvas.toBlob"));
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = event.target.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
};

export const SubmitSighting = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const position = useAtomValue(userPositionAtom);

  const location = "Your awesome location";

  const submitAurora = api.aurora.submit.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    // toast("Aurora moment submitted succesfully", {
    //   description: location,
    //   action: {
    //     label: "View",
    //     onClick: () => {},
    //   },
    // });
    // return;

    if (file) {
      try {
        console.log("file ->", file);
        const compressedBlob = await compressAndConvertToWebP(file);
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
          // Reset the form or show a success message
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
      <h2 className="text-xl">Save Aurora Moment</h2>
      <label className="-mb-2 text-sm text-muted">Location</label>
      <div className="relative">
        <Gps
          size={24}
          weight="duotone"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <Input value={location} className="pl-10" disabled />
      </div>
      <div className="relative mb-6 overflow-hidden">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="aurora-image-upload"
        />
        <label
          htmlFor="aurora-image-upload"
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-input/50 transition"
        >
          {previewUrl ? (
            <NImage
              src={previewUrl}
              alt="Aurora preview"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          ) : (
            <>
              <span className="flex flex-col items-center gap-2 text-muted">
                <Panorama weight="duotone" size={24} />
                capture an aurora moment
              </span>
            </>
          )}
        </label>
      </div>
      <DialogClose className="w-full" disabled={!file}>
        <Button
          className="w-full rounded-full"
          disabled={!file}
          onClick={handleSubmit}
        >
          Submit sighting
        </Button>
      </DialogClose>
    </>
  );
};
