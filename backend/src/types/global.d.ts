import { WebSocket } from "ws";

declare module 'ws' {
  export interface WebSocket extends WebSocket {
    id: string;
  }
}