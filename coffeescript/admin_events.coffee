(($) ->
	LCS.events = ->
		LCS.wrapper.on "load:init", "form", ->
			$(this).find(".not_loading, .success").stop().hide()
			$(this).find(".loading").stop().fadeIn()
		
		LCS.wrapper.on "load:success", "form", ->
			$(this).find(".loading, .not_loading").stop().hide()
			$(this).find(".success").stop().fadeIn()
		
		LCS.wrapper.on "load:fail", "form", ->
			$(this).find(".loading, .success").stop().hide()
			$(this).find(".not_loading").stop().fadeIn()
		
		LCS.wrapper.on "click", ".show_admin", ->
			LCS.setRoute "/convos"
			LCS.wrapper.removeClass "installing"
			false
		
		LCS.showChatBox = ->
			LCS.wrapper.addClass "chatbox_open"
		
		LCS.hideChatBox = ->
			LCS.wrapper.removeClass "chatbox_open"
		
		LCS.hideAdmin = ->
			LCS.wrapper.removeClass "adminning"
		
		LCS.showAdmin = ->
			LCS.wrapper.addClass "adminning"
		
		LCS.db.onAuth (auth) ->
			if auth
				LCS.db.child("settings/agents/#{auth.uid}").on "value", (snapshot) ->
					if snapshot.val() is null
						LCS.isAgent = false
						LCS.wrapper.removeClass "agent_logged_in"
						LCS.user =
							id: auth.uid
						LCS.user.email = auth.password.email if typeof auth.password != "undefined"
					else
						LCS.isAgent = true
						LCS.user = snapshot.val()
						LCS.wrapper.addClass "agent_logged_in"
						LCS.templates.visitor = Handlebars.compile $("script[data-template='visitor']").html()
						
						LCS.db.child("settings/agents/#{LCS.user.id}/online").on "value", (snapshot) ->
							if snapshot.val() is true
								LCS.admin.find(".toggle_status").removeClass("offline").addClass "online"
							else
								LCS.admin.find(".toggle_status").removeClass("online").addClass "offline"

						LCS.db.child("visitors").on "child_added", (snapshot) ->
							$(LCS.templates.visitor(snapshot.val())).appendTo ".visitors"
							LCS.tipsy()
						
						LCS.db.child("visitors").on "child_changed", (snapshot) ->
							data = snapshot.val()
							visitor = $(".visitor[data-id='#{data.id}']")
							visitor.html $(LCS.templates.visitor(snapshot.val())).html()
							if data.online then visitor.addClass "online" else visitor.removeClass "online"
							if data.has_unread then visitor.addClass "has_unread" else visitor.removeClass "has_unread"								
							LCS.tipsy()
			else
				LCS.isAgent = false
				LCS.user = null
				LCS.wrapper.removeClass("agent_logged_in").removeClass("adminning")
		
		LCS.registerCurrentAgent = ->
			settings = LCS.defaultSettings
			settings.agents["#{LCS.user.id}"] = LCS.user
			settings.agents["#{LCS.user.id}"].online = false
			settings.admins["#{LCS.user.id}"] = true
			LCS.db.child("settings").set settings
		
		LCS.connectAsAgent = (form) ->
			if LCS.isAgent
				form.trigger "load:success"
			else if LCS.agentCount == 0
				LCS.registerCurrentAgent()
				form.trigger "load:success"
			else
				LCS.logout()
				form.trigger "load:fail"
				alert "You are not authorized to log in to this chatbox."
		
		LCS.tipsy = ->
			LCS.wrapper.find("[title]").tipsy
				gravity: "s"
			
		LCS.installer.on "submit", "form", ->
			email = $(this).find("[name='email']").val()
			password = $(this).find("[name='password']").val()
			
			if !email.length || !password.length || email.indexOf("@") == -1
				alert "Please ensure your email address and password are valid."
			else
				form = $(this)
				form.trigger "load:init"
				
				if LCS.user isnt null
					LCS.connectAsAgent form
				else
					LCS.db.authWithPassword
						email: email
						password: password
					, (error, auth) ->
						if error is null
							LCS.connectAsAgent form
						else
							LCS.db.createUser
								email: email
								password: password
							, (error) ->
								if error is null
									
									LCS.db.authWithPassword
										email: email
										password: password
									, (error, auth) ->
										if error is null
											LCS.connectAsAgent form
											form.trigger "load:success"
										else
											form.trigger "load:fail"
											alert "There was an error registering this chatbox."
								else
									form.trigger "load:fail"
									alert "There was an error registering this chatbox."
			false
			
		LCS.leftbar.on "click", "p", ->
			if $(this).hasClass "toggle_status"
				LCS.db.child("settings/agents/#{LCS.user.id}/online").set !$(this).hasClass("online")
			else
				LCS.leftbar.find(".selected").removeClass "selected"
				$(this).addClass "selected"
	
		LCS.visitors.on "click", ".visitor", ->
			id = $(this).data("id")
			LCS.visitors.find(".visitor.selected").removeClass "selected"
			$(this).addClass "selected"
			LCS.db.child("visitors/#{id}/has_unread").set false if $(this).hasClass "has_unread"

		LCS.wrapper.on "click", ".bubble, .agent_avatar", {}, ->
			el = $(this)
			el.removeClass "animated bounceIn"
			el.addClass "animated bounceIn"
			LCS.showChatBox()
			false

		LCS.wrapper.on "click", ".close", ->
			LCS.hideChatBox()
			LCS.hideAdmin()
	
		LCS.chatbox.on "submit", ".new_message", ->
			body = $(this).find("textarea").val()
		
			if body.length
				LCS.addMessage
					incoming: false
					body: body

				setTimeout (->
					LCS.addMessage
						incoming: true
						body: "This is just an example of how Lively 2.0 will function - this chat is not actually hooked up to anything!"

				), 3000
				setTimeout (->
					LCS.addMessage
						incoming: true
						body: "These are pre-programmed messages (you're not actually talking with anyone :D)."

				), 6000
				$(this).closest("form")[0].reset()
			false

		LCS.chatbox.on "keydown", "textarea", (e) ->
			body = $(this).val()
			code = e.keyCode or e.which
			if code is 13
				$(this).closest("form").trigger "submit"
				false

		LCS.new_message.on "keyup", "textarea", ->
			if $(this).val().length
				LCS.chatbox.find("button").addClass "active"
			else
				LCS.chatbox.find("button").removeClass "active"

		LCS.wrapper.find(".field").on "keyup", "input, textarea", ->
			label = $(this).closest(".field").find("label")
			if $(this).val().length
				label.stop().fadeIn 150
			else
				label.stop().fadeOut 150

		LCS.introducer.on "submit", ->
			submit = true
		
			$(this).find("input, textarea").each ->
				val = $(this).val()
				validator = new RegExp($(this).data("validator").replace(/[S|\.]/g, "\\$&").replace(/\+/g, "$&"))	if typeof $(this).data("validator") isnt "undefined"
				if typeof $(this).attr("required") isnt "undefined" and not val.length
					submit = false
					LCS.introduceFieldError $(this).closest(".field"), "Required"
				else if typeof validator isnt "undefined" and not validator.test(val)
					submit = false
					LCS.introduceFieldError $(this).closest(".field"), "Invalid Format"
				else
					$(this).closest(".field").find(".field_error").remove()

			LCS.login()	if submit
			false

		LCS.chatbox.on "click", ".question li[data-value]", ->
			$(this).closest("ul").find("li.selected").removeClass "selected"
			$(this).addClass "selected"
			false
) jQuery