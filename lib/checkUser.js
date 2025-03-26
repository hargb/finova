import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
 
  

  try {
    // Check if user already exists in the database
    const user = await currentUser();
    if (!user || !user.id) {
      
      return null;
    }

    
    const loggedInUser = await db.user.findUnique({
      where: {
         ClerkUserid: user.id
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // Create new user if not found
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const newUser = await db.user.create({
      data: {
        ClerkUserid: user.id,
        name,
        imageUrl: user.imageUrl ?? "",
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
      },
    });
    console.log("New user created:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};
