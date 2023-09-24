"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to the login page
      router.push("/login");
    } else {
      router.push("/home");
    }
  }, [isAuthenticated, isLoading, router]);
}
