'use strict';


module.exports = function(grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
          configFile: 'karma.conf.js',
          singleRun: true,
          reporters: ['mocha'],
          browsers: ['PhantomJS']
      }
    }
  });


  grunt.registerTask('test', ['karma']);

};