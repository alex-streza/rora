"use client";

import { useUser } from "@clerk/nextjs";
import { Cloud, Globe, Hash, Sun } from "@phosphor-icons/react";

import { useLocalStorage } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";

export const WelcomeDialog = () => {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useLocalStorage("welcome-dialog", true);

  return (
    <Dialog open={open && isSignedIn} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="text-[#D7F9EE]">
        <DialogHeader>
          <DialogTitle>Welcome fellow aurora seeker</DialogTitle>
        </DialogHeader>
        <div>
          <p className="mb-5">Some quick facts about the northern lights</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Globe size={24} weight="duotone" className="text-[#7AEBC6]" />{" "}
              most are seen between 60-75 latitude
            </li>
            <li className="flex items-center gap-2">
              <Hash size={24} weight="duotone" className="text-[#7AEBC6]" />
              high KP index = visible at lower latitudes
            </li>
            <li className="flex items-center gap-2">
              <Cloud size={24} weight="duotone" className="text-[#7AEBC6]" />
              high cloud coverage = lower chance to see
            </li>
            <li className="flex items-center gap-2">
              <Sun size={24} weight="duotone" className="text-[#7AEBC6]" />
              faster solar winds = brighter aurora
            </li>
          </ul>

          <Button className="mt-5 w-full" onClick={() => setOpen(false)}>
            Seek the northern lights
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
