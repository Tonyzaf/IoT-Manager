"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import App from "next/app";

export default function Home() {
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
