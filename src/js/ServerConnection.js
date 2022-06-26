import { greyvarproto } from "./greyvarproto.js";

export default class ServerConnection {
  constructor() {
    this.connect()
  }

  connect() {
    try {
      this.sock = new WebSocket("ws://localhost:8080/")
    } catch (e) {
      console.log(e)
    }

    this.sock.onopen = (evt) => {
      console.log("open")

      let msg = greyvarproto.ClientRequests.create({
        registrationRequest: greyvarproto.RegistrationRequest.create({
          username: 'james'
        })
      })

      this.sock.send(greyvarproto.ClientRequests.encode(msg).finish())
    }

    this.sock.onmessage = this.onMessage

    this.sock.onerror = (e) => {
      console.log(e)
    }
  }

  onMessage(m) {
    m.data.arrayBuffer().then(x => {
      let receivedMessage = greyvarproto.ServerFrameResponse.decode(new Uint8Array(x))

      if (receivedMessage.connectionResponse != null) {
        window.renderer.renderConnectionResponse(receivedMessage.connectionResponse)
      }
    })
  }
}
