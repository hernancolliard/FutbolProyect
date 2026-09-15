"use client";

import { Chip } from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";

type ProBadgeProps = {
  label?: string;
  compact?: boolean;
};

export default function ProBadge({ label = "PRO", compact = false }: ProBadgeProps) {
  return (
    <Chip
      icon={<WorkspacePremiumRoundedIcon />}
      label={label}
      size="small"
      sx={{
        height: compact ? 24 : 28,
        color: "#704600",
        border: "1px solid #d7a928",
        bgcolor: "#fff4c7",
        backgroundImage: "linear-gradient(135deg, #fff9df 0%, #f4d66f 100%)",
        boxShadow: "0 5px 14px rgba(154, 103, 0, .16)",
        fontSize: compact ? ".68rem" : ".75rem",
        fontWeight: 950,
        letterSpacing: ".06em",
        "& .MuiChip-icon": {
          ml: compact ? 0.5 : 0.7,
          color: "#9a6700",
          fontSize: compact ? 15 : 17,
        },
      }}
    />
  );
}
