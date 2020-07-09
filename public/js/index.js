Vue.config.devtools = true;

new Vue({
	el: '#login',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		}
	}),

	data: {
		ws: null,
		email: null,
		nickname: null,
		joined: false,
		valid: true,
		nameRules: [
			v => !!v || 'Nickname is required',
			v => (v && v.length <= 30) || 'Name must be less than 30 characters',
		],
		emailRules: [
			v => !!v || 'Email is required',
			v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
		],
	},
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
			}

			// var chat = document.getElementById('chat-messages');
			// chat.scrollTop = chat.scrollHeight; // Auto scroll to the bottom
		});
	},
	methods: {
		join: function () {
			this.$refs.form.validate();

			if (this.valid) {
				this.email = $('<p>').html(this.email).text();
				this.nickname = $('<p>').html(this.nickname).text();
				this.joined = true;
			}

			if (this.joined) {
				this.login();
			}
		},
		login: function () {
			this.ws.send(JSON.stringify({
				email: this.email,
				nickname: this.nickname,
			}));

			location.pathname = "/dashboard.html";
		},
	}
});
