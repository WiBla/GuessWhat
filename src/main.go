package main

import (
	"log"
	"net/http"
	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) // Connected clients
var broadcast = make(chan Message)           // Broadcast channel
// var mutex sync.Mutex

// Configure the upgrader
var upgrader = websocket.Upgrader{}

// Type ...
type Type struct {
	Type string `json:"type"`
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

// User ...
type User struct {
	Nickname string "nickname"
	// Add is_drawing boolean attribute
	IsDrawing bool
}

// Point ...
type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// Stroke ...
type Stroke struct {
	UserID string  `json:"userId"`
	Points []Point `json:"points"`
	Finish bool    `json:"finish"`
}

// Clear ...
type Clear struct {
	UserID string `json:"userId"`
}

func main() {
	// Create a simple server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	// On protège les variables globales utilisées dans nos routines à l'aide
	// de mutex, qui bloque chaque ressources quand elles sont accédée
	// var wg sync.WaitGroup
	// go handleMessages(&wg)
	// wg.Wait()

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
		var msg Message

		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}

		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
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

func handleDrawingDataJson () {

}

// func handleMessages(wg *sync.WaitGroup) {
// 	mutex.Lock()
// 	for {
// 		wg.Add(1)

// 		// Grab the next message from the broadcast channel
// 		msg := <-broadcast
// 		// Send it out to every client that is currently connected
// 		for client := range clients {
// 			err := client.WriteJSON(msg)
// 			if err != nil {
// 				log.Printf("error: %v", err)
// 				client.Close()
// 				delete(clients, client)
// 			}
// 			wg.Done()
// 		}
// 		wg.Wait()
// 	}
// 	mutex.Unlock()
// }
