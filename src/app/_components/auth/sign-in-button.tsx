"use client";
import { useSignIn } from "@clerk/nextjs";
import { GoogleLogo } from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";

export const SignInButton = () => {
  const { signIn } = useSignIn();

  return (
    <Button
      className="items-center gap-2 rounded-full"
      onClick={() =>
        signIn?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        })
      }
    >
      Sign up with Google <GoogleLogo weight="duotone" size="24" />
    </Button>
  );
};
