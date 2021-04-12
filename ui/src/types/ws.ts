const emptyFunction = () => {};

export class WebsocketSource {
  private url: string;
  private ws: WebSocket | undefined;
  private callback: Function;

  constructor(url: string = "", callback?: Function) {
    this.url = url;
    this.ws = undefined;
    this.callback = callback || emptyFunction;
  }

  public getUrl(): string {
    return this.url;
  }

  public subscribe() {
    if (this.callback === emptyFunction) {
      return;
    }

    console.log(`Establishing webSocket connection for ${this.url}`);
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (evt) => {
      const bucket = JSON.parse(evt.data);
      this.callback(bucket);
    };
    this.ws.onclose = () => {
      console.log(`WebSocket connection closing for ${this.url}`);
    };
  }

  public unsubscribe() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
      //this.ws.onmessage = (evt) => {};
    }
  }
}
