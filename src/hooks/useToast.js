import { useState } from "react";
import { COLORS } from "../constants/colors";

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, color = COLORS.accent) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, show };
}
