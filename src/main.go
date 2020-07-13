package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
)

var clients = make(map[*websocket.Conn]bool) // Connected clients
var broadcast = make(chan Type)              // Broadcast channel

// Configure the upgrader
var upgrader = websocket.Upgrader{}

// Type ...
type Type struct {
	Type     string `json:"type"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	OldNick  string `json:"oldnick"`
	Message  string `json:"message"`
}

// Message ...
type Message struct {
	Type     string `json:"type"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Message  string `json:"message"`
}

// Nickname ...
type Nickname struct {
	Type     string `json:"type"`
	Nickname string `json:"nickname"`
}

// Image ...
type Image struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

func main() {
	// Create a simple server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	go handleMessages()

	log.Println("http server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}

	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	clients[ws] = true

	for {
		var typ Type
		// var msg Message
		// var nick Nickname
		// var img Image

		err := ws.ReadJSON(&typ)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}

		switch typ.Type {
		case "message":
			fmt.Println(typ)
			broadcast <- typ
			break
		case "nickname":
			fmt.Println(typ)
			broadcast <- typ
			break
		case "image":
			broadcast <- typ
			break

		default:
			fmt.Printf("Websocket: Type de msg inconnu: %s", typ.Type)
			broadcast <- typ
		}

		// err := ws.ReadJSON(&msg)
		// if err != nil {
		// 	log.Printf("error: %v", err)
		// 	delete(clients, ws)
		// 	break
		// }

		// // Send the newly received message to the broadcast channel
		// broadcast <- typ
	}
}

// User ...
type User struct {
	Email    string
	Nickname string
	Host     bool
	Drawing  bool
	Score    int
	Guess    bool
}

// Room ...
type Room struct {
	ID            uuid.UUID
	Name          string
	UserList      map[string]User
	Word          string
	RoundMax      int
	Round         int
	RoundDuration int
	CustomWords   string
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast

		// switch msg.Type {
		// case CreateRoom:
		// 	createRoom()
		// case Message:
		// }

		// Send it out to every client that is currently connected
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
