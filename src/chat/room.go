package chat

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Dashboard Lists all available Rooms
var Dashboard []Room

// Room ...
// type Room struct {
// 	ID            uuid.UUID
// 	Name          string
// 	UserList      map[string]User
// 	Word          string
// 	RoundMax      int
// 	Round         int
// 	RoundDuration int
// 	CustomWords   string
// }

// Room represents a single chat room
type Room struct {
	forward chan []byte
	join    chan *Client
	leave   chan *Client
	Clients map[*Client]bool
	Name    string
}

var upgrader = &websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Fatal("serving http failed ", err)
		return
	}

	Client := &Client{
		socket: socket,
		send:   make(chan []byte, 1024),
		room:   r,
	}

	r.join <- Client
	defer func() {
		r.leave <- Client
	}()
	go Client.write()
	Client.read()
}

// NewRoom creates a new chat room
func NewRoom(name string) *Room {
	newRoom := &Room{
		forward: make(chan []byte),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		Clients: make(map[*Client]bool),
		Name:    name,
	}

	Dashboard = append(Dashboard, *newRoom)
	return newRoom
}

// RoomList prints out the current state of all rooms
func RoomList() {
	for _, e := range Dashboard {
		log.Printf("[room] Room '%v' is available", e.Name)
		for _, e := range e.Clients {
			log.Printf("[room] %v is in the room", e)
		}
	}
}

// Run initializes a chat room
func (r *Room) Run() {
	log.Printf("[room] Running chat room %v", r.Name)
	for {
		select {
		case Client := <-r.join:
			log.Printf("[room] New Client in room %v", r.Name)
			r.Clients[Client] = true
		case Client := <-r.leave:
			log.Printf("[room] Client leaving room %v", r.Name)
			delete(r.Clients, Client)
			close(Client.send)
		case msg := <-r.forward:
			data := FromJSON(msg)
			log.Printf("[room] [#%v] @%v: %v", r.Name, data.Sender, data.Message)
			for Client := range r.Clients {
				select {
				case Client.send <- msg:
				default:
					delete(r.Clients, Client)
					close(Client.send)
				}
			}
		}
	}
}
