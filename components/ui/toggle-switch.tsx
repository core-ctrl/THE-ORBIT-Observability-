"use client";

import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  ariaLabel = "Toggle",
}: ToggleSwitchProps) {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        isSm ? "h-5 w-9" : "h-6 w-11"
      } ${
        checked
          ? "bg-white border border-white"
          : "bg-zinc-900 border border-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full shadow-md transform transition duration-200 ease-in-out ${
          checked ? "bg-black" : "bg-white"
        } ${
          isSm ? "h-3.5 w-3.5 mt-[2.5px] ml-[2.5px]" : "h-4 w-4 mt-[3px] ml-[3px]"
        } ${
          checked
            ? isSm
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-0"
        }`}
      />
    </button>
  );
}
