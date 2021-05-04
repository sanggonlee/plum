import Settings from "components/Settings";
import Snapshot from "components/Snapshot";
import Tables from "components/Tables";
import { SubscriptionType } from "types";

export interface RouteConfig {
  path: string;
  label: string;
  isMenu: boolean;
  render: Function;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/monitor",
    label: "Monitor",
    isMenu: true,
    render: () => <Tables />,
  },
  {
    path: "/replay",
    label: "Replay",
    isMenu: true,
    render: () => <Tables subscriptionType={SubscriptionType.REPLAY} />,
  },
  {
    path: "/settings",
    label: "Settings",
    isMenu: true,
    render: () => <Settings />,
  },
  {
    path: "/monitor/snapshot",
    label: "Settings",
    isMenu: false,
    render: () => <Snapshot />,
  },
];
