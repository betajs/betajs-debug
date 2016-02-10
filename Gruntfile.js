module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile/grunt.js');
	var dist = 'betajs-debug';

	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */    
    .concatTask('concat-raw', ['src/fragments/begin.js-fragment', 'src/**/*.js', 'src/fragments/end.js-fragment'], 'dist/' + dist + '-raw.js')
    .preprocessrevisionTask(null, 'dist/' + dist + '-raw.js', 'dist/' + dist + '-noscoped.js')
    .concatTask('concat-scoped', ['vendors/scoped.js', 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')

    /* Testing */
    .closureTask(null, ["./vendors/scoped.js", "./dist/" + dist + "-noscoped.js"])
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js', './tests/**/*.js'])
    
    /* External Configurations */
    .codeclimateTask()
    
    /* Dependencies */
    .dependenciesTask(null, { github: ['betajs/betajs-scoped/dist/scoped.js'] })

    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();

	grunt.initConfig(gruntHelper.config);	

	grunt.registerTask('default', ['readme', 'license', 'codeclimate', 'travis', 'concat-raw', 'preprocessrevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint']);

};