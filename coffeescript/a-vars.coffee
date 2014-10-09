@LCS ||= {}

(($) ->
	Swag.registerHelpers Handlebars

	LCS.user = null
	LCS.agentPresence = null
	LCS.isAgent = false
	LCS.debug = true
	LCS.agentCount = 0
	LCS.templates = {}
	LCS.currentURL = "" + window.location.protocol + "//" + window.location.host + window.location.pathname
	LCS.baseURL = if LCS.debug then "/lively" else "XXX"
	LCS.styleSheet = if LCS.debug then "src/lively.min.css" else "src/lively.min.css"
	LCS.ding = new Howl(
		urls: ["assets/audio/bell.mp3"]
		volume: 1
	)
	
	LCS.setVars = ->
		LCS.wrapper = $("#lcs")
		LCS.chatbox = LCS.wrapper.find(".chatbox")
		LCS.visitors = LCS.wrapper.find(".visitors")
		LCS.admin = LCS.wrapper.find(".admin")
		LCS.leftbar = LCS.admin.find(".leftbar")
		LCS.prompter = LCS.wrapper.find(".prompter")
		LCS.bubble = LCS.prompter.find(".bubble")
		LCS.messages = LCS.chatbox.find(".messages")
		LCS.introducer = LCS.chatbox.find(".introducer")
		LCS.new_message = LCS.chatbox.find(".new_message")
		LCS.overlay = LCS.messages.find(".overlay")
		LCS.installer = LCS.wrapper.find(".install")
		LCS.events()
	
	LCS.defaultSettings =
		include: "*"
		exclude: ""
		introduce:
			first_name:
				type: "input"
				label: "First Name"
				required: true
			email:
				type: "email"
				label: "Email Address"
				required: true
				validator: "S+@S+.S+"
			mobile:
				type: "tel"
				label: "Phone Number"
				required: false
		canned:
			jp:
				body: "Hi there, would you like a coffee?"
				question:
					type: "boolean"
			jk:
				body: "It's okay... I'm just kidding!"
			hi:
				body: "Hi, {{ first_name }}... how can I help you?"
		login:
			facebook: true
		triggers: [
			include: "*"
			exclude: ""
			message:
				body: "This is the new version of Lively. Like it?"

			delay: 1.5
		]
		schedules: []
		admins: {}
		agents: {}

) jQuery