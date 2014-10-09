(($) ->
	@LCS ||= {}
	
	LCS.structure = """
		<div id="lcs" style="display: none;">
			
			<div class="install_overlay">
				<div class="install">
					<form class="form">
						<div class="loading with_padding">
							<img src="#{LCS.baseURL}/assets/imgs/badge_almost.png" class="badge">
							<img src="#{LCS.baseURL}/assets/imgs/loading.gif">
						</div>
						
						<div class="success">
							<div class="fields">
								<p>
									<strong>Thanks for registering!</strong>
								</p>
								<p>
									You're on the right track to connect with your customers in a new way!
								</p>
							</div>
							
							<p class="show_admin button">
								Start Using My Chatbox &nbsp; &rarr;
							</p>
						</div>
						
						<div class="not_loading">
							<img src="#{LCS.baseURL}/assets/imgs/badge_almost.png" class="badge">
								
							<p>
								<strong>Congratulations</strong> &mdash; Lively Chat Support is almost set up. Simply fill in the form below to register your chatbox.
							</p>
							
							<div class="fields">
								<div class="field">
									<label for="install_field_email">Email Address</label>
									<input type="email" id="install_field_email" name="email" placeholder="Email Address" data-validator="EMAIL" required>
								</div>
								<div class="field">
									<label for="install_field_password">Password</label>
									<input type="password" id="install_field_password" name="password" placeholder="Password" data-validator="HASLENGTH" required>
								</div>
								<div class="field">
									<label for="install_field_token" class="force_show">Serial Number</label>
									<input type="text" id="install_field_token" name="token" readonly="readonly">
								</div>
							</div>

							<button type="submit">
								Start Using My Chatbox &nbsp; &rarr;
							</button>
						</div>
					</form>
				</div>
			</div>
			
			<div class="admin">
				<div class="topbar">
					<div class="menu_wrapper">
						<!--<p class="fa fa-bars open_menu icon"></p>-->
					</div>
					<h1>Excite Creative Inc.</h1>
					<p class="close icon">&times;</p>
				</div>
			
				<div class="leftbar">
					<p class="toggle_status offline">
						<i class="fa fa-toggle-on"></i>
						<i class="fa fa-toggle-off"></i>
						<span class="toggle-on">Online</span>
						<span class="toggle-off">Offline</span>
					</p>
					<p class="selected">
						<i class="fa fa-comments icon"></i>
						Convos
					</p>
					<p>
						<i class="fa fa-group icon"></i>
						Agents
					</p>
					<p>
						<i class="fa fa-user icon"></i>
						My Profile
					</p>
					<p>
						<i class="fa fa-cog icon"></i>
						Settings
					</p>
				</div>
				
				<div class="tab" data-tab="!/visitors">
					
					<input type="text" class="visitors_search" placeholder="Search...">
			
					<div class="visitors"></div>
					
				</div>
				
				<div class="tab" data-tab="!/agents">
					This is the agents tab
				</div>
				
				<div class="tab" data-tab="!/canned">
					This is the agents tab
				</div>
				
				<div class="tab" data-tab="!/settings">
					Field install,
					Include, exclude
				</div>
				
				<div class="tab" data-tab="!/triggers">
					Triggers tab
				</div>
				
				<div class="tab" data-tab="!/profile">
					My Profile (timezone, password, email)
				</div>
				
			</div>
		
			<div class="chatbox">
				<div class="topbar">
					<h1>Lively Chat Support</h1>
					<p class="close icon">&times;</p>
				</div>
			
				<div class="header">	
					<div class="profile">
						<img src="assets/imgs/avatar.jpg">
						<p class="served_by_description">
							You're talking to
							<span class="agent_name">Dallas</span>
						</p>
					</div>
				</div>
			
				<div class="messages">
					<div class="overlay"></div>
				</div>
			
				<form class="introducer form">
					<p class="please_introduce">
						To start talking with <span class="agent_name">Dallas</span>,<br>please introduce yourself.
					</p>
				
					<button type="submit" class="fb_button">
						Introduce Myself through Facebook
					</button>
				
					<p class="or">or</p>
				
					<div class="fields"></div>

					<button type="submit">
						Introduce Myself
					</button>
				</form>
			
				<form class="new_message">
					<textarea placeholder="What's on your mind?"></textarea>
					<div class="action_row">
						<button type="submit">Send</button>
						<p class="upload_icon"></p>
						<div class="clear"></div>
					</div>
				</form>
			</div>
		
			<div class="prompter">
				<div class="agent_avatar">
					<p class="unread_messages_count">3</p>
					<img src="assets/imgs/avatar.jpg">
				</div>
				<p class="bubble">
					I was wondering if you had any 3rd apples to display to the crew.
				</p>
			</div>
		
			<script data-template="message" type="text/x-handlebars-template">
				<div class="message {{#incoming}}incoming{{/incoming}}">
					<div class="body">{{{ body }}}</div>
					{{#if question}}
						<div class="question {{ question.type }}">
							{{#is question.type "boolean"}}
								<ul>
									<li data-value="yes" {{#is question.answer "yes"}}class="selected"{{/is}}>Yes</li>
									<li data-value="no" {{#is question.answer "no"}}class="selected"{{/is}}>No</li>
								</ul>
							{{/is}}
						
							<div class="clear"></div>
						</div>
					{{/if}}
				</div>
			</script>
			
			<script data-template="visitor" type="text/x-handlebars-template">
				<div class="visitor {{#if online}}online{{/if}} {{#if has_unread}}has_unread{{/if}}" data-id="{{ id }}">
					<p class="name">
						<span title="{{ email }}">{{ name }}</span>
					</p>
					<p class="icons">
						<i title="Apple" class="fa fa-apple"></i>
						<i title="Windows" class="fa fa-windows"></i>
						<i title="Canada" class="fa fa-flag"></i>
					</p>
					<p class="last_seen">
						<span title="Dec 13, 2014 at 10:04pm">3 hours ago</span>
					</p>
					<div class="clear"></div>
				</div>
			</script>
			
			<script data-template="field" type="text/x-handlebars-template">
				<div class="field">
					<label for="field_{{ name }}">{{ label }}</label>
					{{#is type "textarea"}}
						<textarea placeholder="{{ label }}" id="field_{{ name }}" name="{{ name }}" placeholder="{{ label }}" {{#if validator}}data-validator="{{ validator }}"{{/if}} {{#if required}}required{{/if}}></textarea>
					{{else}}
						<input type="{{ type }}{{#unless type}}text{{/unless}}" id="field_{{ name }}" name="{{ name }}" placeholder="{{ label }}" {{#if validator}}data-validator="{{ validator }}"{{/if}} {{#if required}}required{{/if}}>
					{{/is}}
				</div>
			</script>
		</div>
	"""
	
) jQuery
