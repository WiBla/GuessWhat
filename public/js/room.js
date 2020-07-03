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
				subtitle: "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.",
			},
			{
				avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
				title: 'Jimmy Schuller',
				subtitle: "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?",
			},
			{
				avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
				title: 'Julien Schneider',
				subtitle: "<span class='text--primary'>Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?",
			},
		],
		disabled: false,
		dense: false,
		twoLine: false,
		threeLine: false,
		shaped: false,
		flat: false,
		subheader: false,
		inactive: false,
		subGroup: false,
		nav: false,
		avatar: true,
		rounded: false,
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
		emailRules: [
			v => !!v || 'Email is required',
			v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
		],
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
			}

			// var chat = document.getElementById('chat-messages');
			// chat.scrollTop = chat.scrollHeight; // Auto scroll to the bottom
		});
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
