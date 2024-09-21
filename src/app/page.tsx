import { SignedOut } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { HydrateClient } from "~/trpc/server";
import { SignInButton } from "./_components/auth/sign-in-button";
import AuroraMap from "./_components/map";
import { SightingsDrawer } from "./_components/map/drawer";
import { Navigation } from "./_components/navigation";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="relative mx-auto h-screen w-full max-w-md overflow-hidden border-border bg-card md:border-x">
        <AuroraMap />
        <div className="relative">
          <Navigation />
          <SignedOut>
            <div className="bg-gradient-to-b from-card to-transparent p-5 pt-2">
              <h1 className="mb-2 font-serif text-4xl font-medium leading-[46px] text-primary-foreground">
                This time you&apos;ll catch the northern lights
              </h1>
              <p className="mb-4 text-muted-foreground">
                Beautiful northern lights sightings map, real-time statistics
                and live aurora oval.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create an account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      This time you&apos;ll witness the aurora
                    </DialogTitle>
                  </DialogHeader>
                  <SignInButton />
                </DialogContent>
              </Dialog>
            </div>
          </SignedOut>
        </div>
        <SightingsDrawer />
      </main>
    </HydrateClient>
  );
}
