import { Outlet } from "react-router-dom";

export function BlankLayout() {
  return (
    <div className="h-full min-h-screen bg-background overflow-y-auto">
      <Outlet />
    </div>
  );
}
