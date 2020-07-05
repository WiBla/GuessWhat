Vue.config.devtools = true;

new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		}
	}),

	data: () => ({
		item: 5,
		items: [
			{
				avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
				title: 'Julien Calcada',
			},
			{
				avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
				title: 'Jimmy Schuller',
			},
			{
				avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
				title: 'Julien Schneider',
			},
		],
		ws: null,
		email: null,
		nickname: null,
		newMsg: '',
		nickname: '',
		chats: [],
		joined: false,
		valid: true,
		nameRules: [
			v => !!v || 'Nickname is required',
			v => (v && v.length <= 30) || 'Name must be less than 30 characters',
		],

		drawing: false,
	}),
	created: function() {
		var self = this;
		this.ws = new WebSocket('ws://' + window.location.host + '/ws');
		this.ws.addEventListener('message', function(e) {
			var msg = JSON.parse(e.data);

			switch(msg.type) {
				case "message":
					self.chats.push({
						type: "message",
						avatar: self.gravatarURL(msg.email),
						nickname: msg.nickname,
						message: emojione.toImage(msg.message),
					});
				break;

				case "nickname":
					self.chats.push({
						type: "alert",
						color: "info",
						message: `Someone changed their nickname to ${msg.nickname}`,
					});
				break;

				case "image":
					var img = new Image();
					img.onload = function() {
						ctx1.clearRect(0, 0, width, height);
						ctx1.drawImage(img, 0, 0);
					}
					img.src = msg.message;
				break;

				default:
					console.log("Unknown WebSocket message type: "+msg.type);
			}

			// var chat = document.getElementById('chat-messages');
			// chat.scrollTop = chat.scrollHeight; // Auto scroll to the bottom
		});

		setInterval(function() {
			if (self.drawing) {
				canvas.toBlob(function(blob) {
					var reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onloadend = function() {
						var base64String = reader.result;
						self.ws.send(JSON.stringify({
							type: "image",
							message: base64String,
						}));
					}
				}, 'image/png', 0.1);
			}
		}, 100, self);
	},
	methods: {
		send() {
			if (this.newMsg != '') {
				this.ws.send(
					JSON.stringify({
						type: "message",
						email: this.email,
						nickname: this.nickname,
						message: $('<p>').html(this.newMsg).text() // Strip out html
					}
				));
				this.newMsg = ''; // Reset newMsg
			}
		},
		join() {
			this.$refs.form.validate();

			if (this.valid) {
				this.email = $('<p>').html(this.email).text();
				this.nickname = $('<p>').html(this.nickname).text();
				this.joined = true;
			}
		},
		gravatarURL(email) {
			return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
		},
		changeNickname() {
			this.ws.send(JSON.stringify({
				type: "nickname",
				nickname: this.nickname,
			}));
		},
		tool(tool) {
			switch(tool) {
				case 'pencil':
				case 'eraser':
					mouse.tool = tool;
				break;

				case 'fill':
				case 'clear':
					useTool(tool);
				break;
			}
		}
	}
});
