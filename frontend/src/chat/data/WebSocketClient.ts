import { ClientEvent, ServerEvent } from './Api-Types-v3';

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        resolve();
      };
      this.socket.onerror = error => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  async disconnect(): Promise<void> {
    return new Promise(resolve => {
      if (this.socket) {
        this.socket.onclose = () => {
          this.socket = null;
          resolve();
        };
        this.socket.close();
      } else {
        resolve();
      }
    });
  }

  async sendMessage(message: ClientEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
        resolve();
      } else {
        reject(new Error('WebSocket is not connected'));
      }
    });
  }
  async isConnected(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.socket) {
        resolve(this.socket.readyState === WebSocket.OPEN);
      } else {
        resolve(false);
      }
    });
  }

  onMessage(callback: (message: ServerEvent) => void): void {
    if (this.socket) {
      this.socket.onmessage = event => {
        const message: ServerEvent = JSON.parse(event.data);
        callback(message);
      };
    }
  }
  onClose(callback: () => void): void {
    if (this.socket) {
      this.socket.onclose = () => {
        callback();
      };
    }
  }
}
