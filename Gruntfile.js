/*jshint node:true*/
module.exports = function (grunt)
{
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                files: {
                    'dist/jquery.steps.js': ['jquery.steps.js']
                }
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("mm/dd/yyyy") %>\\r\\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\r\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                    ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
            },
            all: {
                files: {
                    'dist/jquery.steps.min.js': ['dist/jquery.steps.js']
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {
                        src: [
                            'README.md',
                            /*'changelog.txt',*/
                            'demo/** /*.*',
                            'lib/*.*',
                            'test/** /*.*'
                        ]
                    },
                    {
                        flatten: true,
                        src: ['dist/*.js'],
                        filter: 'isFile'
                    }
                ]
            }
        },
        qunit: {
            files: ['test/index.html']
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    $: true,
                    console: true
                }
            },
            files: [
                'jquery.steps.js'
            ],
            test: {
                options: {
                    globals: {
                        jQuery: true,
                        $: true,
                        QUnit: true,
                        module: true,
                        test: true,
                        start: true,
                        stop: true,
                        expect: true,
                        ok: true,
                        equal: true,
                        deepEqual: true,
                        strictEqual: true
                    }
                },
                files: {
                    src: [
                        'test/test.js'
                    ]
                }
            },
            grunt: {
                files: {
                    src: [
                        'Gruntfile.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', ['jshint'/*, 'qunit'*/]);
    grunt.registerTask('release', ['default', 'concat'/*, 'yuidoc'*/, 'uglify', 'compress']);
};