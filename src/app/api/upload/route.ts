import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "~/server/db/supabase";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const userId = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const formData = await request.formData();
  const image = formData.get("image") as Blob;

  const fileID = nanoid();
  const filePath = `/public/sighting_${fileID}.webp`;

  const { data, error } = await supabase.storage
    .from("rora-images")
    .upload(filePath, image);

  if (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }

  return new NextResponse(
    JSON.stringify({
      id: fileID,
    }),
    {
      status: 200,
    },
  );
}
