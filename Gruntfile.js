module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      dist: {
        src: ['bower_components/jquery/dist/jquery.js', 'src/js/lightbox.js'],
        dest: 'dist/js/lightbox-plus-jquery.js',
      },
    },
    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**'],
            dest: 'dist/'
          }
        ],
      },
    },
    jshint: {
      all: [
        'src/js/lightbox.js'
      ],
      options: {
        jshintrc: true
      }
    },
    jscs: {
      src: [
        'src/js/lightbox.js'
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
          'dist/js/lightbox.min.js': ['src/js/lightbox.js'],
          'dist/js/lightbox-plus-jquery.min.js': ['dist/js/lightbox-plus-jquery.js']
        }
      }
    },
    watch: {
      jshint: {
        files: ['src/js/lightbox.js'],
        tasks: ['jshint', 'jscs']
      },
      sass: {
        files: ['src/sass/**/*.sass'],
        tasks: ['sass']
      }
    },
    cssmin: {
      minify: {
        src: 'dist/css/lightbox.css',
        dest: 'dist/css/lightbox.min.css'
      }
    },
    sass: {
      minify: {
        options: {
          noCache: true,
          sourcemap: 'none',
          style: 'compressed'
        },
        files: {
          'dist/css/lightbox.min.css': ['src/sass/**/*.sass']
        }
      },
      default: {
        options: {
          noCache: true,
          sourcemap: 'none',
          style: 'expanded'
        },
        files: {
          'dist/css/lightbox.css': ['src/sass/**/*.sass']
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      dist: {
        files: {
          'dist/css/lightbox.css': 'dist/css/lightbox.css',
          'dist/css/lightbox.min.css': 'dist/css/lightbox.min.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask('default', ['connect', 'watch']);
  grunt.registerTask('test', ['jshint', 'jscs']);
  grunt.registerTask('build', ['jshint', 'jscs', 'copy:dist', 'concat', 'uglify', 'cssmin:minify']);
  grunt.registerTask('buildsass', ['sass', 'autoprefixer']);
};
