module.exports = function(grunt) {

  grunt.initConfig({
    compass: {
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          environment: 'production'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    },
    jshint: {
      all: [
        "js/lightbox.js"
      ],
      options: {
        jshintrc: true
      }
    },
    jscs: {
      src: [
        "js/lightbox.js"
      ],
      options: {
        config: ".jscsrc"
      }
    },
    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true
      },
      dist: {
        files: {
          'js/lightbox.min.js': ['js/lightbox.js']
        }
      }
    },   
    watch: {
      sass: {
        files: ['sass/*.sass'],
        tasks: ['compass'],
        options: {
          livereload: true,
          spawn: false
        },
      },
      jshint: {
        files: ['js/lightbox.js'],
        tasks: ['jshint', 'jscs']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask('default', ['compass', 'connect', 'watch']);
  grunt.registerTask('test', ['jshint', 'jscs']);
};