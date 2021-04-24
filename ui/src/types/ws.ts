import { TimeseriesAPIOptions } from "types/timeseries";
import { optionsToQueryParams } from "utils";

const emptyFunction = () => {};

export class WebsocketSource {
  private ws: WebSocket | undefined;

  constructor(
    private baseUrl: string = "",
    private callback: Function = emptyFunction
  ) {
    this.ws = undefined;
  }

  public getUrl(): string {
    return this.baseUrl;
  }

  public subscribe(options: TimeseriesAPIOptions) {
    if (this.callback === emptyFunction) {
      return;
    }

    const url = `${this.baseUrl}?${optionsToQueryParams(options)}`;
    console.log(`Establishing webSocket connection for ${url}`);
    this.ws = new WebSocket(url);
    this.ws.onmessage = (evt) => {
      const bucket = JSON.parse(evt.data);
      this.callback(bucket);
    };
    this.ws.onclose = () => {
      console.log(`WebSocket connection closing for ${url}`);
    };
  }

  public unsubscribe() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
