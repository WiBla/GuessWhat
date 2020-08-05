package chat

import "github.com/gorilla/websocket"

// Client represents a single client instance
type Client struct {
	socket *websocket.Conn
	send   chan []byte
	room   *Room
	user   *User
}

// User represents a single user
type User struct {
	Email    string
	Nickname string
	Host     bool
	Drawing  bool
	Score    int
	Guess    bool
}

func (c *Client) read() {
	for {
		if _, msg, err := c.socket.ReadMessage(); err == nil {
			c.room.forward <- msg
		} else {
			break
		}
	}
	c.socket.Close()
}

func (c *Client) write() {
	for msg := range c.send {
		if err := c.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
	c.socket.Close()
}
