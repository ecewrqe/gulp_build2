const gulp = require('gulp');
const zip = require('gulp-zip');
var scp = require('gulp-scp');
gulp.task('build-remote', function(done) {
    console.log('======================> Send dist file to remote');
    gulp.src('dist/**/**')
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./'))
        .pipe(scp({
            host: '192.168.41.22',
            user: 'euewrqe',
            port: 22,
            path: '~',

        }))
        .on('end', function () {
            console.log('======================> Send dist file to remote Done');
            done();
        })
});
