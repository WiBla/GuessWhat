new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      dark: true,
    }
	}),

  data: () => ({
    roomName: "",
    rooms: [{
			name: "This is just a test",
			host: "Someone"
    }, {
			name: "This is just a test",
			host: "Someone"
    },],
		ws: null,
	}),
	created: function() {
		var self = this;
		this.ws = new WebSocket(`ws://${window.location.host}/ws`);

		this.ws.addEventListener('open', function(e) {
			self.ws.send(JSON.stringify({
				type: "dashboard",
			}));
		});

		this.ws.addEventListener('message', function(e) {
			var msg = JSON.parse(e.data);

			switch(msg.type) {
				case 'dashboard':
					self.rooms = msg.rooms;
				break;
			}
		});

		this.ws.addEventListener('error', function(e) {
			console.error("[WebSocket]: ", e);
		});

		this.ws.addEventListener('close', function() {
			location.reload();
		});
	}
});
