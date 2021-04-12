import Tables from "components/Tables";
import Settings from "components/Settings";
import Snapshot from "components/Snapshot";

export interface RouteConfig {
  path: string;
  label: string;
  isMenu: boolean;
  render: Function;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/about",
    label: "About",
    isMenu: true,
    render: () => <div>about</div>,
  },
  {
    path: "/tables",
    label: "Tables",
    isMenu: true,
    render: () => <Tables />,
  },
  {
    path: "/settings",
    label: "Settings",
    isMenu: true,
    render: () => <Settings />,
  },
  {
    path: "/tables/snapshot",
    label: "Settings",
    isMenu: false,
    render: () => <Snapshot />,
  },
];
