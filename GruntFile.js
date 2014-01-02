module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dir: {
            deploy: {
                root:   'deploy/',
                js:     'deploy/js',
                assets: 'deploy/assets',
                atlas:  'deploy/assets/atlas',
                css:    'deploy/css'
            },
            src: {
                root:   'src/',
                lib:    'src/lib/',
                js:     'src/js/**/*.js',
                assets: 'src/assets/',
                css:    'src/css/',
                index:  'src/index.html'
            },
            assets: {
                root:   'assets/',
                atlas:  'assets/atlas/',
                maps:   'assets/maps/**/*.json',
                audio:  'assets/audio/'
            }
        },

        mkdir: {
            all: {
                options: {
                    mode: 0700,
                    create: [
                        'assets/atlas', 'assets/maps', 'assets/audio',
                        'deploy',
                        'resources',
                        'src/css', 'src/js', 'src/lib'
                    ]
                },
            },
        },

        clean: ['<%= dir.deploy.root %>'],

        copy: {
            lib: {
                files: [{
                    cwd: '<%= dir.src.lib %>',
                    src: ['**'],
                    dest: '<%= dir.deploy.js %>',
                    expand: true
                }]
            },
            assets: {
                files: [
                    {
                        cwd: '<%= dir.assets.root %>',
                        src: ['audio/**/*.*'],
                        dest: '<%= dir.deploy.assets %>',
                        expand: true
                    },
                    {
                        cwd: '<%= dir.assets.root %>',
                        src: ['maps/**/*.json'],
                        dest: '<%= dir.deploy.assets %>',
                        expand: true
                    }
                ]
            },
            css: {
                files: [{
                    cwd: '<%= dir.src.root %>',
                    src: ['css/**/*.*'],
                    dest: '<%= dir.deploy.root %>',
                    expand: true
                }]
            }
        },

        replace: {
            index: {
                options: {
                    patterns: [
                        {
                            match: 'GameNamePretty',
                            replacement: '<%= pkg.namePretty %>'
                        },
                        {
                            match: 'GameName',
                            replacement: '<%= pkg.name %>'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= dir.src.index %>'],
                        dest: '<%= dir.deploy.root %>'
                    }
                ]
            }
        },

        concat: {
            game: {
                options: {
                    process: {
                        data: {
                            version: '<%= pkg.version %>',
                            buildDate: '<%= grunt.template.today() %>'
                        }
                    }
                },
                src: ['<%= dir.src.js %>'],
                dest: '<%= dir.deploy.js %>/<%= pkg.name %>.js'
            }
        },

        uglify: {
            game: {
                options: {
                    banner: '/*! Slot Car Racer <%= pkg.version %> | ' +
                            '(c) 2013 Mandarin */ \n'
                },
                src: ['<%= concat.game.dest %>'],
                dest: '<%= dir.deploy.js %>/<%= pkg.name %>.min.js'
            }
        },

        texturepacker: {
            entities: {
                targetdir: '<%= dir.deploy.atlas %>',
                dirs: ['<%= dir.assets.atlas %>entities']
            },
            tileset: {
                targetdir: '<%= dir.deploy.atlas %>',
                tps: '<%= dir.assets.atlas %>tileset.tps',
                dirs: ['<%= dir.assets.atlas %>tileset']
            }
        },

        watch: {
            source: {
                files: '<%= dir.src.js %>',
                tasks: ['updatejs'],
                options: {
                    livereload: true
                }
            },
            maps: {
                files: '<%= dir.assets.maps %>',
                tasks: ['copy:assets'],
                options: {
                    livereload: true
                }
            },
            atlas: {
                files: '<%= dir.assets.atlas %>**/*.*',
                tasks: ['texturepacker'],
                options: {
                    livereload: true
                }
            },
            index: {
                files: '<%= dir.src.index %>',
                tasks: ['replace'],
                options: {
                    livereload: true
                }
            }
        },

        connect: {
            root: {
                options: {
                    // keepalive: true,
                    port: 80,
                    base: './deploy',
                    livereload: true
                }
            }
        },

        open: {
            dev: {
                path: 'http://localhost/index.html',
                app: 'Google Chrome'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadTasks('./tasks');

    grunt.registerTask('build', [
        'concat',
        'uglify',
        'replace',
        'copy'
    ]);
    grunt.registerTask('updatejs', [
        'concat',
        'uglify'
    ]);
    grunt.registerTask('default', [
        'clean',
        'texturepacker',
        'build',
        'connect',
        'open',
        'watch'
    ]);
    grunt.registerTask('init', ['mkdir']);
}
