var path = require('path');

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.initConfig({
    src: 'youtube-preview-extension',
    dest: 'ext',
    tmp: '.tmp',
    builds: 'builds',
    pkg: 'package.json',
    manifestName: 'manifest.json',

    watch: {
      js: {
        files: [
          'youtube-preview-extension/**/*'
        ],
        tasks: [
          'shell:reload'
        ]
      }
    },

    clean: {
      post: [ '<%=tmp %>', 'js', 'css' ],
      pre: [ '<%=dest %>' ]
    },

    jshint: {
      files: ['Gruntfile.js', '<%=src %>/js/**/*.js', '!<%=src %>/js/jquery.js'],
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          // AMD
          module: true,
          require: true,
          // Environments
          console: true,
          // General Purpose Libraries
          $: true,
          jQuery: true,
          // Extension
          chrome: true
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded',
          sourcemap: 'none'
        },
        files: {
          '<%=src %>/css/preview.css': [
            '<%=src %>/css/*.scss'
          ]
        }
      }
    },

    cssmin: {
      options: {
        expand: true,
        flatten: true,
      },
      target: {
        files: {
          '<%=dest %>/youtube-preview.css': [
            '<%=src %>/css/**.css'
          ]
        }
      }
    },

    uglify: {
      options: {
        compress: {
          drop_console: true
        }
      },
      content_scripts: {
        options: {
          compress: {
            drop_console: true
          },
          mangle: { toplevel: true },
          squeeze: { dead_code: false },
          codegen: { quote_keys: true }
        },
        files: {
          '<%=dest %>/youtube-preview.js': [
            '<%=src %>/js/env.js',
            '<%=src %>/js/jquery.js',
            '<%=src %>/js/profiles.youtube.js',
            '<%=src %>/js/preview.js',
            '<%=src %>/js/storyboard.js',
            '<%=src %>/js/video-sparkbar.js',
            '<%=src %>/js/main.js'
          ]
        }
      }
    },

    imagemin: {
      png: {
        options: {
          optimizationLevel: 7
        },
        files: [
          {
            expand: true,
            cwd: './<%=src %>/assets/images/',
            src: ['**/*.png'],
            dest: './<%=dest %>/assets/images/',
            ext: '.png'
          }
        ]
      }
    },

    zip: {
      '<%=builds %>/build-<%=verison %>.zip': [ '<%=dest %>/**' ]
    },

    shell: {
      reload: {
        command: "chrome-cli open chrome://extensions && sleep 1 && chrome-cli reload && chrome-cli close"
      },
      'git-stash': {
        command: 'git stash'
      }
    }
  });

  grunt.registerTask('updateRev', function (key, value) {
    var manifestPath = grunt.config.get('src') + "/" + grunt.config.get('manifestName');
    var manifest = grunt.file.readJSON( manifestPath );

    var verison = manifest.version;
    grunt.config('verison', verison);
  });

  grunt.registerTask('updateManifest', function (key, value) {
    var manifestPath = grunt.config.get('src') + "/" + grunt.config.get('manifestName');
    var manifestDest = grunt.config.get('dest') + "/" + grunt.config.get('manifestName');

    if (!grunt.file.exists(manifestPath)) {
      grunt.log.error("file " + manifestPath + " not found");
      return true;
    }
    var manifest = grunt.file.readJSON(manifestPath);

    grunt.log.error('version: ' + manifest.version);

    // content_scripts/js
    manifest.content_scripts[0].js = [ "youtube-preview.js" ];
    manifest.content_scripts[0].css = [ "youtube-preview.css" ];

    grunt.file.write(manifestDest, JSON.stringify(manifest, null, 2));
  });

  grunt.registerTask('test', [ 'jshint' ]);
  grunt.registerTask('pack', [ 'development', 'updateRev', 'shell:git-stash', 'zip' ]);

  grunt.registerTask('development', [
    'clean:pre',
    'jshint',
    // Minify
    'imagemin',
    'sass',
    'cssmin',
    'uglify',
    //Build
    'updateRev',
    'updateManifest',
    'clean:post'
  ]);

  grunt.registerTask('default', ['development']);
};
