var gulp = require('gulp');
var hb = require('gulp-hb');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var prettify = require('gulp-prettify');
var markdown = require('helper-markdown');
var toc = require('gulp-toc');
var header = require('gulp-header');
var build = require('./build');

gulp.task('build-html', function(done) {
    console.log('======================> Building HTML pages');

    gulp.src([
        build.config.path.src + '/content/**/*.hbs'
    ])
        .pipe(hb({
            partials: build.config.path.src + '/template/**/*.hbs',
            helpers: build.config.path.src + '/template/_helpers/*.js',
            data: Object.assign(build.config.data, build.config.markdown_toc)
        }))

        /* compile handlebars to html pages */
        .pipe(rename({
            extname: '.html'
        }))
        /* clear directory names */
        .pipe(rename({
            dirname: ''
        }))

    /* write html files */
    .pipe(prettify({
            indent_handles: true,
            indent_inner_html: true,
            preserve_newlines: true,
            end_with_newline: true,
            max_preserve_newlines: 0,
            brace_style: 'expand',
            indent_char: '  ',
            indent_size: 2
        }))
        .pipe(gulp.dest(build.config.dist.theme.path))
        .pipe(livereload())
        .on('end', function() {
            console.log('=================> Building HTML pages...DONE!');
            done();
        });

})