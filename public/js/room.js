new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		}
	}),

	data: () => ({
		users: [
			{
				email: 'julien.calcada@gmail.com',
				nickname: 'Julien Calcada',
				host: false,
				drawing: true,
				guess: false,
				score: 1337,
			},
			{
				email: 'contact.wibla@gmail.com',
				nickname: 'WiBla',
				host: false,
				drawing: false,
				guess: false,
				score: 420,
			},
			{
				email: 'julien.schneider@gmail.com',
				nickname: 'Julien Schneider',
				host: true,
				drawing: false,
				guess: true,
				score: 6969,
			},
		],
		ws: null,

		nickname: "WiBla",
		email: "contact.wibla@gmail.com",

		newMsg: '',
		chats: [],
		valid: true,
		nameRules: [
			v => !!v || 'Nickname is required',
			v => (v && v.length <= 30) || 'Name must be less than 30 characters',
		],

		choosingWords: ['one', 'two', 'three'],
		drawing: false,
		timeLeft: 15,
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
						message: `${msg.oldnick} changed their nickname to ${msg.nickname}`,
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
			setTimeout(() => {
				document.getElementById("chat-container").scrollTop = document.getElementById("chat-container").scrollHeight;
			}, 500);
		});

		this.ws.addEventListener('error', function(e) {
			console.error("[WebSocket]: ", e);
		});

		this.ws.addEventListener('close', function() {
			location.reload();
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

		setInterval(function(self) {
			if (self.timeLeft > 0) self.timeLeft--;
		}, 1000, this);
	},
	methods: {
		send() {
			if (this.newMsg != '') {
				if (this.newMsg.charAt(0) == "/") {
					var args = this.newMsg.split(' ');
					cmd = args.shift().slice(1);
					var msg = args.join(' ');

					switch(cmd) {
						case "nick":
							this.ws.send(JSON.stringify({
								type: "nickname",
								oldnick: this.nickname,
								nickname: args[0],
							}));
							this.nickname = args[0];
							break;
					}
				} else {
					this.ws.send(
						JSON.stringify({
							type: "message",
							email: this.email,
							nickname: this.nickname,
							message: this.newMsg
						})
					);
				}

				this.newMsg = '';
			}
		},
		// join() {
		// 	this.$refs.form.validate();

		// 	if (this.valid) {
		// 		this.email = $('<p>').html(this.email).text();
		// 		this.nickname = $('<p>').html(this.nickname).text();
		// 		this.joined = true;
		// 	}
		// },
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
		},
		undo() {
			if (!window.hist.length) return;

			window.undoHist.push(window.hist.pop());
			redraw();
		},
		redo() {
			if (!window.undoHist.length) return;

			window.hist.push(window.undoHist.pop());
			redraw();
		}
	},
	computed: {
		timer: function() {
			if (this.timeLeft <= 0) return "00:00";

			let m = Math.floor(this.timeLeft / 60);
			let s = this.timeLeft % 60;

			if (m < 10) m = '0'+m;
			if (s < 10) s = '0'+s;

			return `${m}:${s}`;
		}
	}
});
