/*jshint node:true*/
module.exports = function (grunt)
{
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                files: {
                    '<%= pkg.folders.dist %>/jquery.steps.js': [
                        '<%= pkg.folders.src %>/banner.js',
                        '<%= pkg.folders.src %>/privates.js',
                        '<%= pkg.folders.src %>/publics.js',
                        '<%= pkg.folders.src %>/enums.js',
                        '<%= pkg.folders.src %>/model.js',
                        '<%= pkg.folders.src %>/defaults.js',
                        '<%= pkg.folders.src %>/helper.js',
                        '<%= pkg.folders.src %>/footer.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                banner: '/*! <%= "\\r\\n * " + pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("mm/dd/yyyy") + "\\r\\n" %>' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <%= (pkg.homepage ? "(" + pkg.homepage + ")" : "") + "\\r\\n" %>' +
                    ' * Licensed under <%= pkg.licenses[0].type + " " + pkg.licenses[0].url + "\\r\\n */\\r\\n" %>',
                report: 'gzip'
            },
            all: {
                files: {
                    '<%= pkg.folders.dist %>/jquery.steps.min.js': ['<%= pkg.folders.dist %>/jquery.steps.js']
                }
            }
        },
        qunit: {
            files: ['test/index.html']
        },
        jshint: {
            files: ['<%= pkg.folders.dist %>/jquery.steps.js'],
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
                },
            },
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
                        'test/tests.js'
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
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    exclude: 'qunit-1.11.0.js',
                    paths: '.',
                    outdir: '<%= pkg.folders.docs %>/'
                }
            }
        },
        clean: {
            api: ["<%= pkg.folders.docs %>"],
            build: ["<%= pkg.folders.dist %>"]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('api', ['clean:api', 'yuidoc']);
    grunt.registerTask('build', ['clean:build', 'concat', 'jshint', 'qunit']);
    grunt.registerTask('release', ['build', 'api', 'uglify']);
};