import { ComponentProps } from "react";

export function Symbol({
  className,
  name,
}: {
  className?: string;
  name: string;
} & ComponentProps<"span">) {
  return (
    <span className={`material-symbols-outlined ${className || ""}`}>
      {name}
    </span>
  );
}
