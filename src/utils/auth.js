import axios from "axios";
import { BASE_URL } from "./baseUrl";

export const isAuthenticated = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/shopify/authenticate-admin`, {
      withCredentials: true, // Ensure cookies are sent
    });
    console.log("Authenticated:", res.data);
    return true;
  } catch (err) {
    console.error("Authentication failed:", err);
    return false;
  }
};
