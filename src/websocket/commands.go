package websocket

import (
	"encoding/json"
	"guesswhat/chat"
	"log"
)

// Type the type of the WS message
type Type struct {
	Type string `json:"type"`
}

// NewRoom a WS message indicating to create a new room
type NewRoom struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

// Nickname a WS message instructing a nickname change
type Nickname struct {
	Type     string `json:"type"`
	OldNick  string `json:"oldnick"`
	Nickname string `json:"nickname"`
}

// Image a WS message representing a canvas image
type Image struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

// Message ...
// type Message struct {
// 	Type     string `json:"type"`
// 	Email    string `json:"email"`
// 	Nickname string `json:"nickname"`
// 	Message  string `json:"message"`
// }

// Commands Finds and execute the right command sent from the websocket
func Commands(p *[]byte) (message *Type) {
	json.Unmarshal(*p, &message)
	// log.Printf("[commands] %v", *message)

	switch (*message).Type {
	case "dashboard":
		d := chat.Dashboard

		log.Printf("[commands] %+v\n", d)
		break
	case "newroom":
		// chat.NewRoom()
		break
	default:
		log.Println("[commands] Unrecognized message type: " + (*message).Type)
	}

	return
}
