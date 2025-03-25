import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";

const PrivateRoute = ({ component }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAuth(result);
      if (!result) {
        window.location.href = `https://partners.shopify.com/organizations`;
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return <div>Loading...</div>; // Prevents flickering

  return auth ? component : null;
};

export default PrivateRoute;
