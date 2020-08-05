package main

import (
	"fmt"
	"net/http"

	"guesswhat/chat"
	"guesswhat/websocket"
)

// var clients = make(map[*websocket.Conn]bool) // Connected clients
// var broadcast = make(chan Type)              // Broadcast channel

// Configure the upgrader
// var upgrader = websocket.Upgrader{}

// func main() {
// 	// Create a simple server
// 	fs := http.FileServer(http.Dir("../public"))
// 	http.Handle("/", fs)

// 	// Configure websocket route
// 	http.HandleFunc("/ws", handleConnections)

// 	// Start listening for incoming chat messages
// 	go handleMessages()

// 	log.Println("http server started on :80")
// 	err := http.ListenAndServe(":80", nil)
// 	if err != nil {
// 		log.Fatal("ListenAndServe: ", err)
// 	}
// }

// func handleConnections(w http.ResponseWriter, r *http.Request) {
// 	// Upgrade initial GET request to a websocket
// 	ws, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	// Make sure we close the connection when the function returns
// 	defer ws.Close()

// 	// Register our new client
// 	clients[ws] = true

// 	for {
// 		var typ Type
// 		// var msg Message
// 		// var nick Nickname
// 		// var img Image

// 		err := ws.ReadJSON(&typ)
// 		if err != nil {
// 			log.Printf("error: %v", err)
// 			delete(clients, ws)
// 			break
// 		}

// 		switch typ.Type {
// 		case "message":
// 			log.Printf("[%v]: %v", typ.Nickname, typ.Message)
// 			broadcast <- typ
// 			break
// 		case "nickname":
// 			fmt.Println(typ)
// 			broadcast <- typ
// 			break
// 		case "image":
// 			broadcast <- typ
// 			break
// 		case "dashboard":
// 			// TO-DO Send real data
// 			ws.WriteMessage(websocket.TextMessage, []byte("{\"type\": \"dashboard\",\"rooms\": [{\"name\": \"My first room\",\"host\": \"WiBla\"}]}"))
// 			break

// 		default:
// 			fmt.Printf("Websocket: Type de msg inconnu: %s", typ.Type)
// 			broadcast <- typ
// 		}
// 	}
// }

// func handleMessages() {
// 	for {
// 		// Grab the next message from the broadcast channel
// 		msg := <-broadcast

// 		// switch msg.Type {
// 		// case CreateRoom:
// 		// 	createRoom()
// 		// case Message:
// 		// }

// 		// Send it out to every client that is currently connected
// 		for client := range clients {
// 			err := client.WriteJSON(msg)
// 			if err != nil {
// 				log.Printf("error: %v", err)
// 				client.Close()
// 				delete(clients, client)
// 			}
// 		}
// 	}
// }

func serveWs(w http.ResponseWriter, r *http.Request) {
	ws, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
	}
	go websocket.Writer(ws)
	websocket.Reader(ws)
}

func setupRoutes() {
	http.HandleFunc("/ws", serveWs)
}

func main() {
	setupRoutes()
	chat.Run()
}
