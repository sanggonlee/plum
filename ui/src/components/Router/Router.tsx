import { Switch, Route } from "react-router-dom";
import { RouteConfig, routeConfigs } from "./routeConfigs";

export default function Router() {
  return (
    <Switch>
      {routeConfigs.map(({ path, render }: RouteConfig) => (
        <Route key={path} exact path={path}>
          {render()}
        </Route>
      ))}
    </Switch>
  );
}
