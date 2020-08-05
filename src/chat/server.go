package chat

import (
	"log"
	"net/http"
)

// Run starts a new chat server with 4 chat rooms, listening on port 8080
func Run() {
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	for _, name := range []string{"Test1", "Test2"} {
		r := NewRoom(name)
		http.Handle("/chat/"+name, r)
		go r.Run()
	}

	log.Printf("[server] Starting chat server on port 80")

	RoomList()

	// setupRoutes()
	if err := http.ListenAndServe(":80", nil); err != nil {
		log.Fatal("[server] Starting server failed: ", err)
	}
}
