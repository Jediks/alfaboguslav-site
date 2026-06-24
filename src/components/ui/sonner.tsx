"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    position="top-right"
    richColors
    {...props}
  />
);

export { Toaster };
