module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        curly: true, //真，JSHint会要求你在使用if和while等结构语句时加上{}来明确代码块
        debug: true, //真，JSHint会允许代码中出现debugger的语句
        immed: true, //真，JSHint要求匿名函数的调用如下(function(){ // }());
        latedef: true, // 允许定义放在后面，对于函数定义是可以这样的
        newcap: true, //真，JSHint会要求每一个构造函数名都要大写字母开头。 
        noarg: true, //真，JSHint会禁止arguments.caller和arguments.callee的使用 arguments对象是一个类数组的对象
        sub: true, //真，JSHint会允许各种形式的下标来访问对象
        undef: true, //真，JSHint会要求所有的非全局变量，在使用前都被声明
        boss: true, //真，那么JSHint会允许在if，for，while里面编写赋值语句，但要注意是不是错误！
        eqnull: true, //真，JSHint会允许使用"== null"作比较
        strict: false, //严格模式关闭
        unused: true, //真，检测没有使用的变量
      },
      // http://zhang.zipeng.info/vimwiki/Entries/Reference/Tools/jshint.html
      globals: {
        jQuery: true,
        zepto: true,
        $: true,
        console: true
      },
      files: ['lib/*.js', 'index.js']

    },

    compass: {
      dev: {
        options: {
          config: 'config.rb'
        }
      },
      build: {
        options: {
          config: 'config.rb',
          outputStyle: 'compressed',
          cssDir: 'src/css/'
        }
      }
    },


    // concat: {
    //   options: {
    //     separator: ';\n'
    //   },
    //   dist: {
    //     // the files to concatenate
    //     // src: ['src/js/zepto.js'],
    //     // the location of the resulting JS file
    //   }
    // },
    // uglify: {
    //   options: {},
    //   dist: {
    //     src: 'src/js/demo.js',
    //     dest: 'src/js/demo.min.js'
    //   }
    // },

    watch: {
      //grunt watch:js|css
      js: {
        files: ['index.js', 'lib/*.js'],
        tasks: ['jshint'],
      },
      css: {
        files: ['src/sass/*.scss'],
        tasks: ['compass:dev'],
      }
    },
    imagemin: {
      dist: {
        options: { // Target options
          optimizationLevel: 3
        },
        src: ['src/img/*', 'src/img/**/*'],
        dest: 'src/imgmin/'
      }
    },
    compress: {
      main: {
        options: {
          archive: 'node-weibo.zip'
        },
        files: [{
          expand: true,
          cwd: './',
          src: ['**'],
          filter: 'isFile'
        }]
      }
    }
  });

  // grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  //livereload
  //img min
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.registerTask('build', ['uglify', 'concat', 'compass:build']);

  grunt.registerTask('imgmin', ['imagemin']);

};