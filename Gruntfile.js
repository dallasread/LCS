module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
		coffee: {
			compileJoined: {
				options: {
					bare: true,
					join: true
				},
				files: {
					"src/lively.js": ["coffeescript/*.coffee"],
				}
	    }
	  },
		sass: {
	    dist: {
	      files: {
					"src/lively.css": ["scss/main.scss"],
	      }
	    }
	  },
    uglify: {
      js: {
				options: {
					banner: "/*! <%= pkg.name %> <%= pkg.version %> compiled on <%= grunt.template.today('yyyy-mm-dd') %> */\n",
				},
				files: {
					"src/lively.min.js": [
						"coffeescript/vendor/jquery.js",
						"coffeescript/vendor/firebase.js",
						"coffeescript/vendor/handlebars-v2.0.0.js",
						"coffeescript/vendor/howler.js",
						"coffeescript/vendor/underscore.js",
						"coffeescript/vendor/underscore-query.js",
						"coffeescript/vendor/jquery.tipsy.js",
						"coffeescript/vendor/swag.min.js",
						"coffeescript/vendor/touche.js",
						"src/lively.js"
					],
				}
      }
    },
		cssmin: {
		  css: {
				options: {
					banner: "/*! <%= pkg.name %> <%= pkg.version %> compiled on <%= grunt.template.today('yyyy-mm-dd') %> */\n",
				},
				files: {
					"src/lively.min.css": ["src/lively.css"]
				}
		  }
		},
		watch: {
		  js: {
		    files: ["coffeescript/*.coffee", "coffeescript/vendor/*.js"],
		    tasks: ["coffee", "uglify"]
		  },
		  css: {
		    files: ["scss/*.scss", "scss/vendor/*.scss"],
		    tasks: ["sass", "cssmin"]
		  }
		}
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask("default", ["coffee", "sass", "uglify", "cssmin"]);

};