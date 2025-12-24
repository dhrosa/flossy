import { ReactNode } from "react";

/** Top-of-page title component. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="page-title">
      <div className="level">
        <div className="level-item">
          <h1 className="title">{children}</h1>
        </div>
      </div>
      <hr />
    </div>
  );
}
