module.exports = function(grunt) {

  grunt.initConfig({
    host_config: grunt.file.readJSON('.host_config'),
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
    exec: {
      zip: {
        cmd: function(version) {
          return ['rm -rf lightbox',
                  'mkdir lightbox',
                  'cp index.html lightbox',
                  'cp README.markdown lightbox',
                  'cp -r css lightbox',
                  'cp -r js lightbox',
                  'cp -r img lightbox',
                  'zip -r lightbox-' + version + '.zip lightbox',
                  'mv lightbox-' + version + '.zip releases',
                  'rm -rf lightbox'
                 ].join('&&');
        }
      },
    },
    'ftp-deploy': {
      build: {
        auth: {
          host: '<%- host_config.host %>',
          port: '<%- host_config.port %>'
        },
        src: '.',
        dest: '<%- host_config.directory %>',
        exclusions: [
          '.DS_Store',
          '.sass-cache',
          '.git*',
          '.host_config',
          '.ftppass',
          'node_modules',
          'sass',
          'Gruntfile.js',
          'package.json',
          'README.markdown'
        ]
      }
    },
    jshint: {
      files: ['js/lightbox.js']
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
      test: {
        files: ['js/lightbox.js'],
        tasks: ['jshint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-ftp-deploy');


  grunt.registerTask('default', ['compass', 'connect', 'watch']);
  grunt.registerTask('zip', '', function(version) {
    grunt.task.run('jshint');
    grunt.task.run('uglify');
    grunt.task.run('exec:zip:' + version);
  });
};