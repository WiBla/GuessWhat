package main

import (
	"github.com/kataras/iris"
	"github.com/kataras/iris/websocket"
)

func main() {
	ws := websocket.New(websocket.Config{})

	ws.OnConnection(func(c websocket.Connection) {
		c.On("clientMessage", func(msg string) {
			c.To(websocket.Broadcast).Emit("serverMessage", msg)
		})
	})

	app := iris.New()

	app.Get("/", func(ctx iris.Context) {
		ctx.ServeFile("index.html", false)
	})

	app.Get("/socket-iris.js", func(ctx iris.Context) {
		ctx.Write(websocket.ClientSource)
	})

	app.Any("/sock", ws.Handler())

	app.Run(iris.Addr(":1234"))
}
