// src/hooks/useFetchData.js

import { AuthAxios } from "../helpers/axiosInstance";
import { getCookie } from "../utils/cookieAuth";
import { useQuery } from "@tanstack/react-query";

// useFetchData(queryKey, apiUrl)              — fetch immediately (default)
// useFetchData(queryKey, apiUrl, { enabled }) — fetch only when enabled === true
const useFetchData = (queryKey, apiUrl, options = {}) => {
  const token = getCookie("authToken");
  const { enabled = true } = options;

  const fetchData = async () => {
    try {
      const response = await AuthAxios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch data");
    }
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: fetchData,
    keepPreviousData: true,
    staleTime: 5000,
    enabled,
  });

  return { data, error, isLoading, refetch };
};

export default useFetchData;
