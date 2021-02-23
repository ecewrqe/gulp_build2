'use strict'

var gulp = require('gulp');
var gutil = require('gulp-util');
var build = require('./build'); // build -> build.json
var func = require('./compile');

// merge with default parameters
var args = Object.assign({
    'prod': false
}, gutil.env);


gulp.task('build-bundle', function(done){
    console.log('==============> Generating bundles...');



    // bundle & src
    func.objectBuildTree(build.build, function(val){
        if(typeof val.src !== 'undefined' && typeof val.bundle !== 'undefined'){
            func.bundle(val);
        }
    });
    done();
});