module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine', 'sinon'],
    
    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/underscore/underscore.js',
      'bower_components/backbone/backbone.js',
      'app/**/**.js',
      'test/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    singleRun: true,
    reporters: ['mocha'],
    browsers: ['PhantomJS']

  });
};