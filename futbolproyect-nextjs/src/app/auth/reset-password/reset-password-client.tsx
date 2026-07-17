"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import publicApi from "@/lib/publicApi";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation("common");

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(t("reset_token_invalid"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await publicApi.post("/users/reset-password", {
        token,
        newPassword: password,
      });

      setSuccess(t("password_updated_success"));
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("reset_password_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder={t("new_password_label")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button disabled={loading}>{t("change_password")}</button>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </form>
  );
}
