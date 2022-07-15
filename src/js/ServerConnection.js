import { greyvarproto } from "./greyvarproto.js";
import Grid from './Grid.js'
import Tile from './Tile.js'

export default class ServerConnection {
  constructor() {
    this.connect()
  }

  connect() {
    try {
      const address = "ws://" + window.location.hostname + ":8080/"

      this.sock = new WebSocket(address)
      this.sock.onerror = this.onError
      this.sock.onclose = this.onClose
    } catch (e) {
      console.error(e)
    }

    this.sock.onopen = (evt) => {
      let msg = greyvarproto.ClientRequests.create({
        registrationRequest: greyvarproto.RegistrationRequest.create({
          username: 'james'
        })
      })

      this.sock.send(greyvarproto.ClientRequests.encode(msg).finish())
    }

    this.sock.onmessage = this.onMessage

    this.sock.onerror = (e) => {
      console.error(e)
    }
  }

  onMessage(m) {
    m.data.arrayBuffer().then(x => {
      let receivedMessage = greyvarproto.ServerUpdate.decode(new Uint8Array(x))

      if (receivedMessage.connectionResponse != null) {
        window.gameState.addMessage(receivedMessage.connectionResponse)
      }

      if (receivedMessage.grid != null) {
        //this.onMessageGrid(receivedMessage.grid)
        const newGrid = new Grid()

        for (const netTile of receivedMessage.grid.tiles) {
          const tile = new Tile()
          tile.fromNet(netTile)

          newGrid.set(tile.col, tile.row, tile)
        }
      
        window.gameState.onNewGrid(newGrid)
      }

      if (receivedMessage.playerJoined != null) {
        window.gameState.onPlayerJoined(receivedMessage.playerJoined)
      }

      for (const entdef of receivedMessage.entityDefinitions) {
        window.gameState.onEntdef(entdef)
      }

      for (const ent of receivedMessage.entitySpawns) {
        window.gameState.onEntitySpawn(ent)
      }

      for (const entpos of receivedMessage.entityPositions) {
        window.gameState.onEntityPosition(entpos)
      }
    })
  }

  sendMoveRequest(vec) {
    let msg = greyvarproto.ClientRequests.create({
        moveRequest: greyvarproto.MoveRequest.create(vec)
      })

    this.sock.send(greyvarproto.ClientRequests.encode(msg).finish());

  }

  onMessageGrid(msgGrid) {
  }

  disconnect() {
    this.onClosed()
    this.sock.disconnect();
  }

  onClose() {
    console.error("ServerConnection closed")
  }
}
