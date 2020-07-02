Vue.config.devtools = true;

new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		}
	}),

	data: {
		message: "",
		response: "",
	},
	methods: {
		send() {
			console.log(`J'envoie "${this.message}" au websocket`);
			this.ws.send(JSON.stringify({ message: this.message }));
		}
	},
	mounted: function() {
		this.ws = new WebSocket(`ws://${window.location.host}/ws`);
		this.ws.addEventListener('message', (e) => {
			this.response = e.data;
			// var msg = JSON.parse(e.data);
			// this.response = msg;
		})

		this.ws.onopen = () => {
			console.log("successfuully connected");
			this.ws.send(JSON.stringify({
				"message": "Hi from the client"
			}));
		}

		this.ws.onclose = (event) => {
			console.log("Socket Closed Connection", event);
		}

		this.ws.onerror = (error) => {
			console.log("Socket Error: ", error);
		}
	}
});
