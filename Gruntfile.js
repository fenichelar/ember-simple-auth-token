module.exports = function(grunt) {
  this.registerTask('lint', 'Applies all the JSHint/spacing rules', [
    'jshint',
    'lintspaces'
  ]);

  grunt.initConfig({
    jshint: {
      app: 'app/*/*.js',
      options: {
        jshintrc: '.jshintrc'
      }
    },

    lintspaces: {
      all: {
        src: [
          'app/*/*.js',
        ],
        options: {
          newline: true,
          trailingspaces: true,
          indentation: 'spaces',
          spaces: 2
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lintspaces');

};
