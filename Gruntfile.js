'use strict';

var request = require('request');

module.exports = function (grunt) {
  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app.js',
          'app/**/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        },
      },
      css: {
        files: ['public/css/*.css'],
        options: {
          livereload: reloadPort
        },
      },
      sass: {
        files: ['public/**/*.sass', 'public/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: reloadPort
        },
      },
      jade: {
        files: ['views/**/*.jade'],
        options: {
          livereload: reloadPort
        },
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public/',
          // Ignore both _partial.scss and bourbon for includes
          src:['**/*.sass', '**/*.scss', '!**/_*.sass', '!**/_*.scss', '!bourbon/**/*.sass', '!bourbon/**/*.scss'],
          dest: 'public/css',
          flatten: true,
          ext: '.css'
        }]
      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
        var reloaded = !err && res.statusCode === 200;
        if (reloaded) {
          grunt.log.ok('Delayed live reload successful.');
        } else {
          grunt.log.error('Unable to make a delayed live reload.');
        }
        done(reloaded);
      });
    }, 500);
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['develop', 'sass', 'watch']);
};
