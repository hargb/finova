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
      console.log("🔍 API Response:", response);

      if (!response) {
        throw new Error("API returned undefined or null.");
      }

      // Safer way to parse response
      let jsonData;
      if (response.ok !== undefined) {
        try {
          jsonData = await response.json();
        } catch (parseError) {
          console.error("❌ JSON Parsing Failed:", parseError);
          jsonData = response;
        }
        
      } else {
        jsonData = response;
      }

      console.log("✅ Parsed Data:", jsonData);

      if (!jsonData || jsonData.success === false) {
        throw new Error(jsonData?.message || "Something went wrong");
      }

      setData(jsonData);
      setError(null);
      return jsonData;
    } catch (error) {
      setError(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
