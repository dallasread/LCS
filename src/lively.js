this.LCS || (this.LCS = {});

(function($) {
  Swag.registerHelpers(Handlebars);
  LCS.user = null;
  LCS.agentPresence = null;
  LCS.isAgent = false;
  LCS.debug = true;
  LCS.agentCount = 0;
  LCS.templates = {};
  LCS.currentURL = "" + window.location.protocol + "//" + window.location.host + window.location.pathname;
  LCS.baseURL = LCS.debug ? "/lively" : "XXX";
  LCS.styleSheet = LCS.debug ? "src/lively.min.css" : "src/lively.min.css";
  LCS.ding = new Howl({
    urls: ["assets/audio/bell.mp3"],
    volume: 1
  });
  LCS.setVars = function() {
    LCS.wrapper = $("#lcs");
    LCS.chatbox = LCS.wrapper.find(".chatbox");
    LCS.visitors = LCS.wrapper.find(".visitors");
    LCS.admin = LCS.wrapper.find(".admin");
    LCS.leftbar = LCS.admin.find(".leftbar");
    LCS.prompter = LCS.wrapper.find(".prompter");
    LCS.bubble = LCS.prompter.find(".bubble");
    LCS.messages = LCS.chatbox.find(".messages");
    LCS.introducer = LCS.chatbox.find(".introducer");
    LCS.new_message = LCS.chatbox.find(".new_message");
    LCS.overlay = LCS.messages.find(".overlay");
    LCS.installer = LCS.wrapper.find(".install");
    return LCS.events();
  };
  return LCS.defaultSettings = {
    include: "*",
    exclude: "",
    introduce: {
      first_name: {
        type: "input",
        label: "First Name",
        required: true
      },
      email: {
        type: "email",
        label: "Email Address",
        required: true,
        validator: "S+@S+.S+"
      },
      mobile: {
        type: "tel",
        label: "Phone Number",
        required: false
      }
    },
    canned: {
      jp: {
        body: "Hi there, would you like a coffee?",
        question: {
          type: "boolean"
        }
      },
      jk: {
        body: "It's okay... I'm just kidding!"
      },
      hi: {
        body: "Hi, {{ first_name }}... how can I help you?"
      }
    },
    login: {
      facebook: true
    },
    triggers: [
      {
        include: "*",
        exclude: "",
        message: {
          body: "This is the new version of Lively. Like it?"
        },
        delay: 1.5
      }
    ],
    schedules: [],
    admins: {},
    agents: {}
  };
})(jQuery);

(function($) {
  return LCS.events = function() {
    LCS.wrapper.on("load:init", "form", function() {
      $(this).find(".not_loading, .success").stop().hide();
      return $(this).find(".loading").stop().fadeIn();
    });
    LCS.wrapper.on("load:success", "form", function() {
      $(this).find(".loading, .not_loading").stop().hide();
      return $(this).find(".success").stop().fadeIn();
    });
    LCS.wrapper.on("load:fail", "form", function() {
      $(this).find(".loading, .success").stop().hide();
      return $(this).find(".not_loading").stop().fadeIn();
    });
    LCS.wrapper.on("click", ".show_admin", function() {
      LCS.setRoute("/convos");
      LCS.wrapper.removeClass("installing");
      return false;
    });
    LCS.showChatBox = function() {
      return LCS.wrapper.addClass("chatbox_open");
    };
    LCS.hideChatBox = function() {
      return LCS.wrapper.removeClass("chatbox_open");
    };
    LCS.hideAdmin = function() {
      return LCS.wrapper.removeClass("adminning");
    };
    LCS.showAdmin = function() {
      return LCS.wrapper.addClass("adminning");
    };
    LCS.db.onAuth(function(auth) {
      if (auth) {
        return LCS.db.child("settings/agents/" + auth.uid).on("value", function(snapshot) {
          if (snapshot.val() === null) {
            LCS.isAgent = false;
            LCS.wrapper.removeClass("agent_logged_in");
            LCS.user = {
              id: auth.uid
            };
            if (typeof auth.password !== "undefined") {
              return LCS.user.email = auth.password.email;
            }
          } else {
            LCS.isAgent = true;
            LCS.user = snapshot.val();
            LCS.wrapper.addClass("agent_logged_in");
            LCS.templates.visitor = Handlebars.compile($("script[data-template='visitor']").html());
            LCS.db.child("settings/agents/" + LCS.user.id + "/online").on("value", function(snapshot) {
              if (snapshot.val() === true) {
                return LCS.admin.find(".toggle_status").removeClass("offline").addClass("online");
              } else {
                return LCS.admin.find(".toggle_status").removeClass("online").addClass("offline");
              }
            });
            LCS.db.child("visitors").on("child_added", function(snapshot) {
              $(LCS.templates.visitor(snapshot.val())).appendTo(".visitors");
              return LCS.tipsy();
            });
            return LCS.db.child("visitors").on("child_changed", function(snapshot) {
              var data, visitor;
              data = snapshot.val();
              visitor = $(".visitor[data-id='" + data.id + "']");
              visitor.html($(LCS.templates.visitor(snapshot.val())).html());
              if (data.online) {
                visitor.addClass("online");
              } else {
                visitor.removeClass("online");
              }
              if (data.has_unread) {
                visitor.addClass("has_unread");
              } else {
                visitor.removeClass("has_unread");
              }
              return LCS.tipsy();
            });
          }
        });
      } else {
        LCS.isAgent = false;
        LCS.user = null;
        return LCS.wrapper.removeClass("agent_logged_in").removeClass("adminning");
      }
    });
    LCS.registerCurrentAgent = function() {
      var settings;
      settings = LCS.defaultSettings;
      settings.agents["" + LCS.user.id] = LCS.user;
      settings.agents["" + LCS.user.id].online = false;
      settings.admins["" + LCS.user.id] = true;
      return LCS.db.child("settings").set(settings);
    };
    LCS.connectAsAgent = function(form) {
      if (LCS.isAgent) {
        return form.trigger("load:success");
      } else if (LCS.agentCount === 0) {
        LCS.registerCurrentAgent();
        return form.trigger("load:success");
      } else {
        LCS.logout();
        form.trigger("load:fail");
        return alert("You are not authorized to log in to this chatbox.");
      }
    };
    LCS.tipsy = function() {
      return LCS.wrapper.find("[title]").tipsy({
        gravity: "s"
      });
    };
    LCS.installer.on("submit", "form", function() {
      var email, form, password;
      email = $(this).find("[name='email']").val();
      password = $(this).find("[name='password']").val();
      if (!email.length || !password.length || email.indexOf("@") === -1) {
        alert("Please ensure your email address and password are valid.");
      } else {
        form = $(this);
        form.trigger("load:init");
        if (LCS.user !== null) {
          LCS.connectAsAgent(form);
        } else {
          LCS.db.authWithPassword({
            email: email,
            password: password
          }, function(error, auth) {
            if (error === null) {
              return LCS.connectAsAgent(form);
            } else {
              return LCS.db.createUser({
                email: email,
                password: password
              }, function(error) {
                if (error === null) {
                  return LCS.db.authWithPassword({
                    email: email,
                    password: password
                  }, function(error, auth) {
                    if (error === null) {
                      LCS.connectAsAgent(form);
                      return form.trigger("load:success");
                    } else {
                      form.trigger("load:fail");
                      return alert("There was an error registering this chatbox.");
                    }
                  });
                } else {
                  form.trigger("load:fail");
                  return alert("There was an error registering this chatbox.");
                }
              });
            }
          });
        }
      }
      return false;
    });
    LCS.leftbar.on("click", "p", function() {
      if ($(this).hasClass("toggle_status")) {
        return LCS.db.child("settings/agents/" + LCS.user.id + "/online").set(!$(this).hasClass("online"));
      } else {
        LCS.leftbar.find(".selected").removeClass("selected");
        return $(this).addClass("selected");
      }
    });
    LCS.visitors.on("click", ".visitor", function() {
      var id;
      id = $(this).data("id");
      LCS.visitors.find(".visitor.selected").removeClass("selected");
      $(this).addClass("selected");
      if ($(this).hasClass("has_unread")) {
        return LCS.db.child("visitors/" + id + "/has_unread").set(false);
      }
    });
    LCS.wrapper.on("click", ".bubble, .agent_avatar", {}, function() {
      var el;
      el = $(this);
      el.removeClass("animated bounceIn");
      el.addClass("animated bounceIn");
      LCS.showChatBox();
      return false;
    });
    LCS.wrapper.on("click", ".close", function() {
      LCS.hideChatBox();
      return LCS.hideAdmin();
    });
    LCS.chatbox.on("submit", ".new_message", function() {
      var body;
      body = $(this).find("textarea").val();
      if (body.length) {
        LCS.addMessage({
          incoming: false,
          body: body
        });
        setTimeout((function() {
          return LCS.addMessage({
            incoming: true,
            body: "This is just an example of how Lively 2.0 will function - this chat is not actually hooked up to anything!"
          });
        }), 3000);
        setTimeout((function() {
          return LCS.addMessage({
            incoming: true,
            body: "These are pre-programmed messages (you're not actually talking with anyone :D)."
          });
        }), 6000);
        $(this).closest("form")[0].reset();
      }
      return false;
    });
    LCS.chatbox.on("keydown", "textarea", function(e) {
      var body, code;
      body = $(this).val();
      code = e.keyCode || e.which;
      if (code === 13) {
        $(this).closest("form").trigger("submit");
        return false;
      }
    });
    LCS.new_message.on("keyup", "textarea", function() {
      if ($(this).val().length) {
        return LCS.chatbox.find("button").addClass("active");
      } else {
        return LCS.chatbox.find("button").removeClass("active");
      }
    });
    LCS.wrapper.find(".field").on("keyup", "input, textarea", function() {
      var label;
      label = $(this).closest(".field").find("label");
      if ($(this).val().length) {
        return label.stop().fadeIn(150);
      } else {
        return label.stop().fadeOut(150);
      }
    });
    LCS.introducer.on("submit", function() {
      var submit;
      submit = true;
      $(this).find("input, textarea").each(function() {
        var val, validator;
        val = $(this).val();
        if (typeof $(this).data("validator") !== "undefined") {
          validator = new RegExp($(this).data("validator").replace(/[S|\.]/g, "\\$&").replace(/\+/g, "$&"));
        }
        if (typeof $(this).attr("required") !== "undefined" && !val.length) {
          submit = false;
          return LCS.introduceFieldError($(this).closest(".field"), "Required");
        } else if (typeof validator !== "undefined" && !validator.test(val)) {
          submit = false;
          return LCS.introduceFieldError($(this).closest(".field"), "Invalid Format");
        } else {
          return $(this).closest(".field").find(".field_error").remove();
        }
      });
      if (submit) {
        LCS.login();
      }
      return false;
    });
    return LCS.chatbox.on("click", ".question li[data-value]", function() {
      $(this).closest("ul").find("li.selected").removeClass("selected");
      $(this).addClass("selected");
      return false;
    });
  };
})(jQuery);

(function($) {
  return LCS.setRoute = function(path) {
    switch (path) {
      case "/convos":
        return LCS.wrapper.addClass("adminning");
    }
  };
})(jQuery);

(function($) {
  this.LCS || (this.LCS = {});
  return LCS.structure = "<div id=\"lcs\" style=\"display: none;\">\n	\n	<div class=\"install_overlay\">\n		<div class=\"install\">\n			<form class=\"form\">\n				<div class=\"loading with_padding\">\n					<img src=\"" + LCS.baseURL + "/assets/imgs/badge_almost.png\" class=\"badge\">\n					<img src=\"" + LCS.baseURL + "/assets/imgs/loading.gif\">\n				</div>\n				\n				<div class=\"success\">\n					<div class=\"fields\">\n						<p>\n							<strong>Thanks for registering!</strong>\n						</p>\n						<p>\n							You're on the right track to connect with your customers in a new way!\n						</p>\n					</div>\n					\n					<p class=\"show_admin button\">\n						Start Using My Chatbox &nbsp; &rarr;\n					</p>\n				</div>\n				\n				<div class=\"not_loading\">\n					<img src=\"" + LCS.baseURL + "/assets/imgs/badge_almost.png\" class=\"badge\">\n						\n					<p>\n						<strong>Congratulations</strong> &mdash; Lively Chat Support is almost set up. Simply fill in the form below to register your chatbox.\n					</p>\n					\n					<div class=\"fields\">\n						<div class=\"field\">\n							<label for=\"install_field_email\">Email Address</label>\n							<input type=\"email\" id=\"install_field_email\" name=\"email\" placeholder=\"Email Address\" data-validator=\"EMAIL\" required>\n						</div>\n						<div class=\"field\">\n							<label for=\"install_field_password\">Password</label>\n							<input type=\"password\" id=\"install_field_password\" name=\"password\" placeholder=\"Password\" data-validator=\"HASLENGTH\" required>\n						</div>\n						<div class=\"field\">\n							<label for=\"install_field_token\" class=\"force_show\">Serial Number</label>\n							<input type=\"text\" id=\"install_field_token\" name=\"token\" readonly=\"readonly\">\n						</div>\n					</div>\n\n					<button type=\"submit\">\n						Start Using My Chatbox &nbsp; &rarr;\n					</button>\n				</div>\n			</form>\n		</div>\n	</div>\n	\n	<div class=\"admin\">\n		<div class=\"topbar\">\n			<div class=\"menu_wrapper\">\n				<!--<p class=\"fa fa-bars open_menu icon\"></p>-->\n			</div>\n			<h1>Excite Creative Inc.</h1>\n			<p class=\"close icon\">&times;</p>\n		</div>\n	\n		<div class=\"leftbar\">\n			<p class=\"toggle_status offline\">\n				<i class=\"fa fa-toggle-on\"></i>\n				<i class=\"fa fa-toggle-off\"></i>\n				<span class=\"toggle-on\">Online</span>\n				<span class=\"toggle-off\">Offline</span>\n			</p>\n			<p class=\"selected\">\n				<i class=\"fa fa-comments icon\"></i>\n				Convos\n			</p>\n			<p>\n				<i class=\"fa fa-group icon\"></i>\n				Agents\n			</p>\n			<p>\n				<i class=\"fa fa-user icon\"></i>\n				My Profile\n			</p>\n			<p>\n				<i class=\"fa fa-cog icon\"></i>\n				Settings\n			</p>\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/visitors\">\n			\n			<input type=\"text\" class=\"visitors_search\" placeholder=\"Search...\">\n	\n			<div class=\"visitors\"></div>\n			\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/agents\">\n			This is the agents tab\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/canned\">\n			This is the agents tab\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/settings\">\n			Field install,\n			Include, exclude\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/triggers\">\n			Triggers tab\n		</div>\n		\n		<div class=\"tab\" data-tab=\"!/profile\">\n			My Profile (timezone, password, email)\n		</div>\n		\n	</div>\n\n	<div class=\"chatbox\">\n		<div class=\"topbar\">\n			<h1>Lively Chat Support</h1>\n			<p class=\"close icon\">&times;</p>\n		</div>\n	\n		<div class=\"header\">	\n			<div class=\"profile\">\n				<img src=\"assets/imgs/avatar.jpg\">\n				<p class=\"served_by_description\">\n					You're talking to\n					<span class=\"agent_name\">Dallas</span>\n				</p>\n			</div>\n		</div>\n	\n		<div class=\"messages\">\n			<div class=\"overlay\"></div>\n		</div>\n	\n		<form class=\"introducer form\">\n			<p class=\"please_introduce\">\n				To start talking with <span class=\"agent_name\">Dallas</span>,<br>please introduce yourself.\n			</p>\n		\n			<button type=\"submit\" class=\"fb_button\">\n				Introduce Myself through Facebook\n			</button>\n		\n			<p class=\"or\">or</p>\n		\n			<div class=\"fields\"></div>\n\n			<button type=\"submit\">\n				Introduce Myself\n			</button>\n		</form>\n	\n		<form class=\"new_message\">\n			<textarea placeholder=\"What's on your mind?\"></textarea>\n			<div class=\"action_row\">\n				<button type=\"submit\">Send</button>\n				<p class=\"upload_icon\"></p>\n				<div class=\"clear\"></div>\n			</div>\n		</form>\n	</div>\n\n	<div class=\"prompter\">\n		<div class=\"agent_avatar\">\n			<p class=\"unread_messages_count\">3</p>\n			<img src=\"assets/imgs/avatar.jpg\">\n		</div>\n		<p class=\"bubble\">\n			I was wondering if you had any 3rd apples to display to the crew.\n		</p>\n	</div>\n\n	<script data-template=\"message\" type=\"text/x-handlebars-template\">\n		<div class=\"message {{#incoming}}incoming{{/incoming}}\">\n			<div class=\"body\">{{{ body }}}</div>\n			{{#if question}}\n				<div class=\"question {{ question.type }}\">\n					{{#is question.type \"boolean\"}}\n						<ul>\n							<li data-value=\"yes\" {{#is question.answer \"yes\"}}class=\"selected\"{{/is}}>Yes</li>\n							<li data-value=\"no\" {{#is question.answer \"no\"}}class=\"selected\"{{/is}}>No</li>\n						</ul>\n					{{/is}}\n				\n					<div class=\"clear\"></div>\n				</div>\n			{{/if}}\n		</div>\n	</script>\n	\n	<script data-template=\"visitor\" type=\"text/x-handlebars-template\">\n		<div class=\"visitor {{#if online}}online{{/if}} {{#if has_unread}}has_unread{{/if}}\" data-id=\"{{ id }}\">\n			<p class=\"name\">\n				<span title=\"{{ email }}\">{{ name }}</span>\n			</p>\n			<p class=\"icons\">\n				<i title=\"Apple\" class=\"fa fa-apple\"></i>\n				<i title=\"Windows\" class=\"fa fa-windows\"></i>\n				<i title=\"Canada\" class=\"fa fa-flag\"></i>\n			</p>\n			<p class=\"last_seen\">\n				<span title=\"Dec 13, 2014 at 10:04pm\">3 hours ago</span>\n			</p>\n			<div class=\"clear\"></div>\n		</div>\n	</script>\n	\n	<script data-template=\"field\" type=\"text/x-handlebars-template\">\n		<div class=\"field\">\n			<label for=\"field_{{ name }}\">{{ label }}</label>\n			{{#is type \"textarea\"}}\n				<textarea placeholder=\"{{ label }}\" id=\"field_{{ name }}\" name=\"{{ name }}\" placeholder=\"{{ label }}\" {{#if validator}}data-validator=\"{{ validator }}\"{{/if}} {{#if required}}required{{/if}}></textarea>\n			{{else}}\n				<input type=\"{{ type }}{{#unless type}}text{{/unless}}\" id=\"field_{{ name }}\" name=\"{{ name }}\" placeholder=\"{{ label }}\" {{#if validator}}data-validator=\"{{ validator }}\"{{/if}} {{#if required}}required{{/if}}>\n			{{/is}}\n		</div>\n	</script>\n</div>";
})(jQuery);

(function($) {
  LCS.addStyleSheets = function() {
    return $("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + LCS.styleSheet + "\">");
  };
  LCS.addStructure = function() {
    $(LCS.structure).appendTo("body");
    return LCS.structure = "";
  };
  LCS.install = function() {
    LCS.wrapper.addClass("installing");
    LCS.installer.find("#install_field_token").val(LCS.token);
    LCS.installer.show();
    return LCS.installer.find("#install_field_email").focus();
  };
  LCS.showAdmin = function() {
    LCS.wrapper.removeClass("installing");
    return LCS.wrapper.addClass("adminning");
  };
  LCS.disableBodyScroll = function() {
    return $("body").css("overflow", "hidden");
  };
  LCS.enableBodyScroll = function() {
    return $("body").css("overflow", "auto");
  };
  LCS.logout = function() {
    return LCS.db.unauth();
  };
  LCS.start = function() {
    if (LCS.user === null || typeof LCS.settings.admins[LCS.user.id] === null) {
      return LCS.wrapper.addClass("available");
    } else {
      return LCS.setRoute("/convos");
    }
  };
  LCS.init = function() {
    LCS.token = $("script[data-lively]").data("lively");
    LCS.baseDB = new Firebase("https://lively-chat-support.firebaseio.com/");
    LCS.db = LCS.baseDB.child(LCS.token);
    LCS.addStyleSheets();
    LCS.addStructure();
    LCS.setVars();
    LCS.db.child("settings/agents").on("value", function(snapshot) {
      if (snapshot.val() !== null) {
        return LCS.agentCount = Object.keys(snapshot.val()).length;
      }
    });
    return LCS.db.child("settings").once("value", function(snapshot) {
      LCS.wrapper.fadeIn();
      if (snapshot.val() === null) {
        return LCS.install();
      } else {
        LCS.settings = snapshot.val();
        return LCS.start();
      }
    });
  };
  return LCS.init();
})(jQuery);
