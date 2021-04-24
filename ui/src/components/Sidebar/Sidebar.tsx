import { memo } from "react";
import { Link } from "react-router-dom";
import { RouteConfig, routeConfigs } from "components/Router";

const isMenu = (route: RouteConfig) => route.isMenu;

function Sidebar() {
  return (
    <div className="flex-initial h-full p-8 pr-16 bg-blue-50 text-xl text-left">
      {routeConfigs.filter(isMenu).map(({ path, label }) => (
        <div className="p-3" key={path}>
          <Link to={path}>{label}</Link>
        </div>
      ))}
    </div>
  );
}

export default memo(Sidebar);
