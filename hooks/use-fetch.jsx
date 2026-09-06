"use client";

import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);

      if (!response) {
        throw new Error("No response received from the server.");
      }

      // Server Actions normally return plain objects.
      // Keep this fallback for API Response objects.
      let result = response;

      if (response instanceof Response) {
        try {
          result = await response.json();
        } catch {
          throw new Error("Invalid response received from the server.");
        }
      }

      if (!result) {
        throw new Error("Invalid response received from the server.");
      }

      if (result.success === false) {
        throw new Error(
          result.error ||
            result.message ||
            "Something went wrong. Please try again."
        );
      }

      setData(result);
      setError(null);

      return result;
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error("Something went wrong. Please try again.");

      console.error("useFetch error:", normalizedError);

      setError(normalizedError);

      toast.error(
        normalizedError.message || "Something went wrong. Please try again."
      );

      // Important: allow the caller to handle the failure too.
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fn,
    setData,
  };
};

export default useFetch;