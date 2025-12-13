import { ComponentProps } from "react";
import { Blend, Floss } from "./Floss";

export function FlossButton({
  floss,
  className,
  title,
  ...rest
}: {
  floss: Floss | Blend;
  title?: string;
  className?: string;
} & ComponentProps<"button">) {
  return (
    <button
      className={"floss button " + (className || "")}
      style={floss.cssStyle}
      title={floss.description + (title ? `\n${title}` : "")}
      {...rest}
    >
      {floss.name}
    </button>
  );
}
