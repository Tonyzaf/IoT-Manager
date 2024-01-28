"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "react-auth-kit";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, []);
}
