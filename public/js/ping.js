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
			this.ws.send(this.message);
		}
	},
	mounted: function() {
		this.ws = new WebSocket(`ws://${window.location.host}/ws`);
		this.ws.addEventListener('message', (e) => {
			var msg = JSON.parse(e.data);
			this.response = msg;
		})
	}
});
