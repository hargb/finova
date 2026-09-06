import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return null;
    }

    // Check if the Clerk user already exists in our database
    const existingUser = await db.user.findUnique({
      where: {
        ClerkUserid: user.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    // Clerk can theoretically have no email address available.
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.error("Clerk user has no email address:", user.id);
      return null;
    }

    const name =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;

    // Create the user in our database
    const newUser = await db.user.create({
      data: {
        ClerkUserid: user.id,
        name,
        imageUrl: user.imageUrl ?? null,
        email,
      },
    });

    console.log("New Finova user created:", newUser.id);

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};