import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChatTeardropDots, Image } from "@phosphor-icons/react/dist/ssr";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { HydrateClient } from "~/trpc/server";
import { Avatar } from "./_components/auth/avatar";
import { SignInButton } from "./_components/auth/sign-in-button";
import { SightingsDrawer } from "./_components/map/drawer";
import { UserPosition } from "./_components/map/user-position";
import { SubmitSighting } from "./_components/map/submit-sighting";
import AuroraMap from "./_components/map";
import { Navigation } from "./_components/navigation";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="relative mx-auto h-screen w-full max-w-md border-border bg-card md:border-x">
        <AuroraMap />
        <div className="relative">
          <Navigation />
          <SignedOut>
            <div className="bg-gradient-to-b from-card to-transparent p-5 pt-2">
              <h1 className="mb-2 font-serif text-[37px] font-medium leading-[46px] text-primary-foreground">
                Aurora notifications like never before
              </h1>
              <p className="mb-4 text-muted-foreground">
                Beautiful northern lights sightings map, paired with awesome SMS
                & e-mail notifications.
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
        <Button
          className="absolute bottom-52 left-1.5 gap-2"
          variant="secondary"
        >
          <ChatTeardropDots weight="duotone" size="24" /> Can I see the northern
          lights?
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="absolute bottom-52 right-1.5 rounded-full"
              size="icon"
            >
              <Image weight="duotone" size="24" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SubmitSighting />
          </DialogContent>
        </Dialog>
        <SightingsDrawer />
      </main>
    </HydrateClient>
  );
}
