Vue.config.devtools = true;

new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		}
	}),

	data: {
		ws: null,        // Our websocket
		newMsg: '',      // Holds new messages to be sent to the server
		chats: [],       // A running list of chat messages displayed on the screen
		id: 0,           // To iterate on the messages
		email: null,     // Email address used for grabbing an avatar
		username: null,  // Our username
		joined: false,   // True if email and username have been filled in
		valid: true,     // Is the join form valid?
		nameRules: [
			v => !!v || 'Username is required',
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
			self.chats.push({
				avatar: self.gravatarURL(msg.email),
				username: msg.username,
				message: emojione.toImage(msg.message),
				id: self.id++,
			});

			var chat = document.getElementById('chat-messages');
			chat.scrollTop = chat.scrollHeight; // Auto scroll to the bottom
		});
	},
	methods: {
		send: function () {
			if (this.newMsg != '') {
				this.ws.send(
					JSON.stringify({
						email: this.email,
						username: this.username,
						message: $('<p>').html(this.newMsg).text() // Strip out html
					}
				));
				this.newMsg = ''; // Reset newMsg
			}
		},
		join: function () {
			this.$refs.form.validate();

			if (this.valid) {
				this.email = $('<p>').html(this.email).text();
				this.username = $('<p>').html(this.username).text();
				this.joined = true;
			}
		},
		gravatarURL: function(email) {
			return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
		}
	}
});
