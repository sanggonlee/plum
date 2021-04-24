import { WebsocketSource } from "types";

const SERVER_WS_BASE_URL = process.env.REACT_APP_WS_SERVER_ORIGIN;

export enum WebsocketSubscriptionType {
  TablesMonitor = "TablesMonitor",
  TablesReplay = "TablesReplay",
}

function invalidWebsocketSubscriptionTypeError(
  type: WebsocketSubscriptionType
) {
  return `Invalid websocket subscription type: ${type}`;
}

// WebSocket singleton.
const wsInstances: {
  [type in WebsocketSubscriptionType]?: WebsocketSource;
} = {};

function getWsSubscriptionUrl(type: WebsocketSubscriptionType): string {
  switch (type) {
    case WebsocketSubscriptionType.TablesMonitor:
      return `${SERVER_WS_BASE_URL}/timeseries`;
    case WebsocketSubscriptionType.TablesReplay:
      return `${SERVER_WS_BASE_URL}/timeseries/replay`;
    default:
      console.error(invalidWebsocketSubscriptionTypeError(type));
      return "";
  }
}

export function registerWebsocketSource(
  type: WebsocketSubscriptionType,
  callback: Function
): WebsocketSource {
  const url = getWsSubscriptionUrl(type);
  if (url === "") {
    return new WebsocketSource();
  }

  let websocketSource = getWebsocketSource(type);
  if (websocketSource) {
    if (url === websocketSource.getUrl()) {
      return websocketSource;
    }

    websocketSource.unsubscribe();
    delete wsInstances[type];
  }

  websocketSource = new WebsocketSource(url, callback);
  wsInstances[type] = websocketSource;
  return websocketSource;
}

export function getWebsocketSource(
  type: WebsocketSubscriptionType
): WebsocketSource | undefined {
  if (!wsInstances[type]) {
    return undefined;
  }
  return wsInstances[type];
}
