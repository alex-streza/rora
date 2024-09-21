import { z } from "zod";
import { env } from "~/env";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { submissions } from "~/server/db/schema";

export const auroraSightingRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        location: z.string().min(1).max(100),
        imageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.insert(submissions).values({
        latitude: input.latitude,
        longitude: input.longitude,
        location: input.location,
        createdAt: new Date(),
        imageUrl: `${env.SUPABASE_URL}/storage/v1/object/public/rora-images/public/sighting_${input.imageId}.webp`,
        status: "pending",
        userId: ctx.auth.userId,
      });

      return {
        message: "Aurora moment submitted succesfully",
      };
    }),

  getLatest: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        since: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sightings = await ctx.db.query.submissions.findMany({
        where: (submissions, { ilike, gte, and }) =>
          and(
            ilike(submissions.location, `%${input.search ?? ""}%`),
            input.since && gte(submissions.createdAt, input.since),
          ),
        orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
      });

      console.log(sightings);

      return sightings ?? null;
    }),
});
