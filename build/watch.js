var gulp = require('gulp');
var path = require('path');
var livereload  = require('gulp-livereload');
var build = require('./build');

// run and watch file changes
gulp.task('watch', function (done) {
    livereload.listen();
    console.log('========================> Watching file changes');

    // watch `.hbs` changes and compile new pages
    gulp.watch(
        [build.config.path.src + '/**/*.hbs'], 
        gulp.series('build-html'))
        .on('change', function(event){
            var file = path.parse(event);
            console.log('=====================> File changed: ' + file.name + '(' + file.ext + ')...');
        });
    // watch `.js` changes & avoiding `.min.js`
    gulp.watch(
        [build.config.path.src + '/**/*.js', 
        build.config.path.src + '/**/*.scss']
        , gulp.series('build-bundle'))
        .on('change', function(event){
            var file = path.parse(event);
            console.log('=====================> File changed: ' + file.name + '(' + file.ext + ')...');
        })
    
    done();
})