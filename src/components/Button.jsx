"use client";

import {CircularProgress} from "@mui/material";
import {IoAddSharp} from "react-icons/io5";

export const Button = ({
  children,
  wfull = false,
  variant = "primary",
  color = "default",
  loading = false,
  className = "",
  ...props
}) => {
  const baseClasses = `
    flex items-center justify-center h-14 px-4 my-2
    text-lg font-semibold rounded-lg shadow-md
    transition-all duration-300 ease-in-out transform
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
  `;

  const variantClasses = {
    primary: `
      bg-sky-600 text-white
      hover:bg-sky-700 hover:shadow-lg
      focus:ring-sky-500
    `,
    secondary: `
      bg-slate-200 text-slate-800
      dark:bg-slate-700 dark:text-slate-100
      hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-lg
      focus:ring-slate-400
    `,
    error: `
      bg-red-600 text-white
      hover:bg-red-700 hover:shadow-lg
      focus:ring-red-500
    `,
  };

  const sizeClasses = wfull ? "w-full" : "w-auto";

  const appliedVariant = color && color !== "default" ? color : variant;

  const finalClassName = `
    ${baseClasses}
    ${variantClasses[appliedVariant] || variantClasses.primary}
    ${sizeClasses}
    ${!loading && !props.disabled ? "hover:scale-105" : ""}
    ${className}
  `;

  return (
    <button
      className={finalClassName.trim().replace(/\s+/g, " ")}
      {...props}
      disabled={loading || props.disabled}
      style={{cursor: props.disabled || loading ? "not-allowed" : "pointer"}}
    >
      {loading ? (
        <CircularProgress color="inherit" size={24} />
      ) : typeof children === "string" && /\b(Novo|Nova)\b/i.test(children) ? (
        <>
          <span className="sr-only">{children}</span>
          <IoAddSharp className="text-3xl" />
        </>
      ) : (
        children
      )}
    </button>
  );
};
