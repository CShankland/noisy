module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bowercopy: {
			options: {
				srcPrefix: "bower_components"
			},
			vendor: {
				options: {
					destPrefix: "js/vendor"
				},
				files: {
					"es5-shim.min.js": "es5-shim/es5-shim.min.js",
					"es6-shim.min.js": "es6-shim/es6-shim.min.js",
					"require.js": "requirejs/require.js"
				}
			}
		}
	});

	// Load the bowercopy plugin
	grunt.loadNpmTasks('grunt-bowercopy');

	// Default task(s).
	grunt.registerTask('default', ['bowercopy']);

};