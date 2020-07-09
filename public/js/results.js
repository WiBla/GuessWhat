new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      dark: true,
    }
  }),
  data: () => ({
    score: [{
      email: "contact.wibla@gmail.com",
      nickname: "WiBla",
      host: true
    }, {
      email: "schuller.jimmy@epitech.eu",
      nickname: "Jimmy",
      host: false
    }, {
      email: "",
      nickname: "This is just a test",
      host: false
    }, {
      email: "",
      nickname: "This is just a test",
      host: false
    }, {
      email: "",
      nickname: "This is just a test",
      host: false
    }]
  }),
  methods: {
    gravatarURL: function(email) {
      return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
    }
  },
});
