var gulp = require('gulp');
const markdown = require('gulp-markdown');
var hb = require('gulp-hb');
var toc = require('gulp-markdown-toc');
var build = require('./build');
gulp.task("markdown", function(done) {
    var src = build.config.path.src + '/content/example.md';
    console.log(src);
    gulp.src([src])
        .pipe(toc())
        .pipe(markdown())
        .pipe(gulp.dest(build.config.dist.theme.path))
        .on('end', function() {
            console.log('=================> Building HTML pages...DONE!');
            done();
        });
})