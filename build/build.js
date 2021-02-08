'use strict'
var gulp = require('gulp');
var log = require("fancy-log");
var config = require('../build.json');



module.exports = config;

gulp.task('build', function(done){
    // console.log(config.config.data.app);
    var tasks = [
        'build-bundle',
        'build-html',
        'watch',
        'connect'
    ];

    return gulp.series(tasks, function(seriesDone){
        seriesDone();
        done();
        log('Build Completed!');
    })();
});