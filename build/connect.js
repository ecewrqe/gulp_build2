var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task("connect", function(done){
    connect.server({
        root: "dist/",
        livereload: true,
        port: 3900,
        fallback: "dist/index.html"
    });
    done();
})