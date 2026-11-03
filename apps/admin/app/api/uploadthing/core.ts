import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@workspace/auth/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  questionAttachment: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .input(
      z.object({
        resourceId: z.string().optional(),
        resourceType: z.enum(["MCQ", "CQ", "CS", "GENERAL"]).default("GENERAL"),
      })
    )
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        userId: session.user.id,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        resourceId: metadata.resourceId,
        resourceType: metadata.resourceType,
        url: file.ufsUrl || file.url,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
