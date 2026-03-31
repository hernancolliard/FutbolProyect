"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <CircularProgress />
    </Box>
  );
}