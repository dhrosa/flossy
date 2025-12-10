// Bulma form components.

import { ComponentProps } from "react";

// A Bulma form field.
export function Field({
  className,
  ...rest
}: { className?: string } & ComponentProps<"div">) {
  return <div className={`field ${className ?? ""}`} {...rest} />;
}

// A field label.
export function Label({ ...rest }: ComponentProps<"label">) {
  return <label className="label" {...rest} />;
}

// A field control.
export function Control({ ...rest }: ComponentProps<"div">) {
  return <div className="control" {...rest} />;
}

// A field error message.
export function ErrorHelp({ ...rest }: ComponentProps<"p">) {
  return <p className="help is-danger" {...rest} />;
}
