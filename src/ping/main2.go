// FICHIER NON UTILISE CAR PAS DE SERVEUR STATIQUE (/public)
// https://www.youtube.com/watch?v=dniVs0xKYKk

package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func reader(conn *websocket.Conn) {
	for {
		messaggeType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		log.Println(string(p))

		if err := conn.WriteMessage(messaggeType, p); err != nil {
			log.Println(err)
			return
		}
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Successfully Connected...")

	reader(ws)
}

func setupRoutes() {
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	http.HandleFunc("/ws", wsEndpoint)
}

func main() {
	fmt.Println("Go WebSockets")

	setupRoutes()

	log.Fatal(http.ListenAndServe(":8080", nil))
}
