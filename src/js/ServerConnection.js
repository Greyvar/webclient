import { greyvarproto } from "./greyvarproto.js";
import Grid from './Grid.js'
import Tile from './Tile.js'

export default class ServerConnection {
  isOk = false;
  
  constructor() {
    this.connect()
  }

  connect() {
    try {
      const address = "wss://" + window.location.hostname + ":8443/api/"

      console.log("address", address)

      this.sock = new WebSocket(address)
      this.sock.onerror = this.onError
      this.sock.onclose = this.onClose
    } catch (e) {
      console.error(e)
    }

    this.sock.onopen = (evt) => {
      isOk = true

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

      for (const entdef of receivedMessage.entityDefinitions) {
        window.gameState.onEntdef(entdef)
      }

      if (receivedMessage.grid != null) {
        const newGrid = new Grid(
          receivedMessage.grid.rowCount,
          receivedMessage.grid.colCount
        )

        for (const netTile of receivedMessage.grid.tiles) {
          const tile = new Tile()
          tile.fromNet(netTile)

          newGrid.set(tile.row, tile.col, tile)
        }
      
        window.gameState.onNewGrid(newGrid)
      }

      if (receivedMessage.playerJoined != null) {
        window.gameState.onPlayerJoined(receivedMessage.playerJoined)
      }
 
      for (const ent of receivedMessage.entitySpawns) {
        window.gameState.onEntitySpawn(ent)
      }

      for (const entpos of receivedMessage.entityPositions) {
        window.gameState.onEntityPosition(entpos)
      }

      for (const entchange of receivedMessage.entityStateChanges) {
        window.gameState.gridScene.onEntityChange(entchange)
      }
    })
  }

  sendMoveRequest(vec) {
    let msg = greyvarproto.ClientRequests.create({
        moveRequest: greyvarproto.MoveRequest.create(vec)
      })

    console.log(msg)

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
