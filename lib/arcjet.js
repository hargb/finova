import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,

  // Rate limiting is tracked separately for each authenticated user.
  characteristics: ["userId"],

  rules: [
    tokenBucket({
      mode: "LIVE",

      // Allow 10 requests per hour.
      refillRate: 10,
      interval: 3600,
      capacity: 10,
    }),
  ],
});

export default aj;