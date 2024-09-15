"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { SignOut } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Maybe = string | undefined | null;

const getFirstLetter = (name: Maybe) => {
  return name?.[0]?.toUpperCase() ?? "";
};

export const Avatar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const caps = `${getFirstLetter(user?.firstName)}${getFirstLetter(user?.lastName)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-border bg-card text-primary-foreground ring-ring ring-offset-background flex h-10 w-10 items-center justify-center rounded-full border outline-none">
        {caps}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => signOut()}
          className="text-destructive focus:bg-destructive/15 focus:text-destructive flex items-center gap-2"
        >
          <SignOut size={20} weight="duotone" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
