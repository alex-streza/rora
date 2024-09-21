"use client";
import { useUser } from "@clerk/nextjs";
import { cn } from "~/lib/utils";
import { Avatar } from "./auth/avatar";
import { UserPosition } from "./map/user-position";
import { SpaceDataTable } from "./map/space-data-table";

export const Navigation = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className={cn("p-5", !isSignedIn && "bg-card")}>
      <span className="mb-3 block font-serif text-2xl">ōrora</span>
      {isSignedIn && <Avatar />}
      <SpaceDataTable />
      <div className="absolute right-5 top-5">
        <UserPosition />
      </div>
    </nav>
  );
};
