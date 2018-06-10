import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { environment } from '../environments/environment';

@Injectable()
export class WebsocketService {

  private socket;

  constructor() { }

  sendMessage(message) {
    this.socket.emit('add-message', message);
  }

  getMessages() {
    const observable = new Observable(observer => {
      this.socket = io(environment.ws_url);
      this.socket.on('message', (data) => {
        console.log('received a message from server');
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

}
