module.exports = function(grunt){

    grunt.initConfig({     //定义任务
        watch: {
            jade: {
                files: ['views/**'],   //监听的文件目录
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'], //监听的文件目录
                // tasks: ['jshint'],  语法检查
                options: {
                    livereload: true  //当文件重新改动的时候重新启动服务
                }
            }
        },

        nodemon: {
            dev: {  // 开发环境
                options: {
                    file: 'app.js',  //当前的入口文件
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['./'],
                    debug: true,
                    delayTime: 1,  //  有大批量的文件要编译的时候，不必每个文件改动就重启一次，而是等待多少毫秒之后再重启服务
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname  // 当前目录
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        } 
    })
    grunt.loadNpmTasks('grunt-contrib-watch')   //文件添加删除修改,grunt就会重新执行这里面的任务
    grunt.loadNpmTasks('grunt-nodemon')    //实时监听入口文件 app.js 出现改动 自动重启app.js
    grunt.loadNpmTasks('grunt-concurrent')  // 针对慢任务 开发的插件 优化构建时间 跑多个阻塞的任务

    grunt.option('force', true)  // 设置true 不要因为语法警告中断grunt的整个服务
    grunt.registerTask('default', ['concurrent'])  //grunt 注册任务
}