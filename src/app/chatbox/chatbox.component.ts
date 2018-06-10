import { Component, OnInit, OnDestroy } from '@angular/core';

import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-chatbox',
  providers: [WebsocketService],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit, OnDestroy {

  messages = [];
  connection;
  message;

  constructor(private websocketService: WebsocketService) { }

  sendMessage() {
    console.log(this.message);
    this.websocketService.sendMessage(this.message);
    this.message = '';
  }

  ngOnInit() {
    this.connection = this.websocketService.getMessages().subscribe(message => {
      this.messages.push(message);
    });
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
