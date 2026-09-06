import { seedTransactions } from "@/actions/seed";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      {
        success: false,
        error: "Seed endpoint is disabled in production.",
      },
      { status: 403 }
    );
  }

  try {
    const result = await seedTransactions();

    if (!result?.success) {
      return Response.json(result, {
        status: 400,
      });
    }

    return Response.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("Seed API error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to seed transactions.",
      },
      { status: 500 }
    );
  }
}