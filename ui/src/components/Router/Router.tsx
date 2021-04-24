import { Switch, Redirect, Route } from "react-router-dom";
import { RouteConfig, routeConfigs } from "./routeConfigs";

export default function Router() {
  return (
    <Switch>
      <Redirect exact from="/" to="/tables" />
      {routeConfigs.map(({ path, render }: RouteConfig) => (
        <Route key={path} exact path={path}>
          {render()}
        </Route>
      ))}
    </Switch>
  );
}
