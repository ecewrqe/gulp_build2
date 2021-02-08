"use strict";
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var gulpif = require("gulp-if");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cleancss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var rtlcss = require('gulp-rtlcss');
var rewrite = require('gulp-rewrite-css');
var sassGlob = require('gulp-sass-glob');
var livereload  = require('gulp-livereload');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var prettify = require('gulp-prettify');
var gutil = require('gulp-util');
var build = require('./build');
var path = require('path');

var fs = require('fs');
var args = Object.assign({
    'prod': false
}, gutil.env);

module.exports = {
    config: Object.assign({}, {
        "path": {
            "src": "./src",
            "node_modules": "./node_modules"
        },
        "dist": {
            "theme": {
                "path": "./dist"
            }
        }
    }, build.config),
    objectBuildTree: function(array, funcname, userdata){
        if(!array || typeof array !== 'object'){
            return false;
        }
        if(typeof funcname !== 'function'){
            return false;
        }
        for(var key in array){
            if(Object.prototype.toString.call(array[key]) === '[object Object]'){
                var funcArgs = [array[key], funcname];
                if(arguments.length > 2){
                    funcArgs.push(userdata);
                }
                if(module.exports.objectBuildTree.apply(null, funcArgs) === false){
                    return false;
                }
            }
            try{
                if(arguments.length > 2){
                    funcname(array[key], key, userdata);
                }else{
                    funcname(array[key], key);
                }
            } catch(e) {
                return false;
            }
        }
        return true;
    },
    jsOutput: function(){
        var config = this.config.compile;

        return lazypipe()
            .pipe(function(){
                return gulpif(config.jsSourcemaps, sourcemaps.init({
                    loadMaps: true,
                    debug: config.debug
                }));
            })
            .pipe(function(){
                return gulpif(config.jsUglify, uglify());
            })
            .pipe(function(){
                return gulpif(config.jsSourcemaps, sourcemaps.write("./"));
            })
    },
    cssOutput: function(){
        var config = this.config.compile;
        return lazypipe()
            .pipe(function(){
                return gulpif(config.cssMinify, cleancss({
                    debug: config.debug
                }));
            })
            .pipe(function(){
                return gulpif(config.autoprefixer, autoprefixer())
            })
            .pipe(function(){
                return gulpif(config.rtl, rtlcss());
            })
            .pipe(function(){
                return gulpif(config.cssSourcemaps, sourcemaps.write("./"))
            })
    },
    outputStream: function(path, outputFile){
        if(typeof outputFile === 'undefined') outputFile = '';
        var piping = lazypipe();
        var outputPaths = [];
        /**
         * path: {$config.output}/css/vendors.bundle.css
         * outputFile: vendors.bundle.css
         * config.dist.themes(app).path: ./dist
         * config.dist.other(app).path: ./output
         * ["./dist", "./output"]
         * set an output path: 
         */
        var regex = new RegExp(/\{\$.*\}/);
        var matched = path.match(regex);
        if(matched){
            for(var app in build.config.dist){
                if(!build.config.dist.hasOwnProperty(app)) continue;
                var output = build.config.dist[app].path;
                outputPaths.push(path.replace(matched[0], output).replace(outputFile, ""));
            }
        }
        
        outputPaths.forEach(function(output){
            (function(_output){
                piping = piping.pipe(function(){
                    return gulp.dest(_output);
                });
            })(output);
        });
        return piping;
    },
    streamPath: function(path){
        var regex = new RegExp(/\{\$(.*?)\}/);
        var dot= function(obj, i){
            return obj[i];
        };
        var matched = path.match(regex);
        if(matched){
            /**
             * matched: {$config.output} or {$config.path.src}
             * build? $config
             * obj[i] -> build[output] -> "./dist" or "./src"
             * example: ${config.output}/css/vendors.bundle.css
             * |output: ./dist/css/vendors.bundle.css
             * set an src path
             */
            var realpath = matched[1].split(".").reduce(dot, build);
            path = path.replace(matched[0], realpath);
            return path;
        }
        return path;
    },
    streamPaths: function(paths){
        /* replace the {$} in every path to real path */
        paths.forEach(function(path, i){
            
            paths[i] = module.exports.streamPath(path);
        })
    },
    cssRewritePaths: function(folder){
        var imgRegex = new RegExp(/\.(gif|jpg|jpeg|tiff|png|ico)$/i);
        var config = this.config;
        
        return lazypipe().pipe(function(){
            return rewrite({
                destination: folder,
                debug: config.debug,
                adaptPath: function(ctx){
                    var isCss = ctx.sourceFile.match(/\.[css]+$/i);
                    if(isCss[0] === '.css'){
                        var pieces = ctx.sourceDir.split('\\');
                        var vendor = pieces[pieces.indexOf('node_modules') + 1];
                        if(pieces.indexOf('node_modules') === -1){
                            vendor = pieces[pieces.indexOf('vendors') + 1];
                        }
                        var file = module.exports.baseName(ctx.targetFile);
                        var extension = 'webfonts/';
                        if(imgRegex.text(file)){
                            extension = 'img/';
                        }
                        return path.join(extension.file);
                    }
                }
            });
        });
    },
    baseName: function(path) {
        /** return a file name */
        var maybeFile = path.split('/').pop();
        if(maybeFile.indexOf('.') !== -1){
            return maybeFile;
        }
        return '';
    },
    bundle: function(bundle){
        /**
         * 
         * "base": {
                "src": {
                    "styles": [
                        "{$config.path.src}/scss/entry.scss"
                    ],
                    "scripts": []
                },
                "bundle": {
                    "styles": "{$config.output}/css/app.bundle.css",
                    "scripts": ""
                }
         * the bundle such as base
         * "base": {
         *      "src": {
         *          "required": {},
         *          "optional": {}
         *      }
         * }
         */
        var _self = this;
        var tasks = [];
        
        if(typeof bundle.src !== 'undefined' && typeof bundle.bundle !== 'undefined'){

            // images and fonts for vendor
            if('required' in bundle.src && 'optional' in bundle.src){
                var vendors = {};
                for(var key in bundle.src){
                    if(!bundle.src.hasOwnProperty(key)) continue;
                    vendors = Object.assign(vendors, bundle.src[key]); // src->required->{pace-js}=>vendors
                    
                }

                for(var vendor in vendors){
                    
                    if(!vendors.hasOwnProperty(vendor)) continue;
                    
                    var vendorObj = vendors[vendor];
                    for(var type in vendorObj){ // type: image, json, media
                        
                        if(!vendorObj.hasOwnProperty(type)) continue;
                        
                        _self.streamPaths(vendorObj[type]);
                        if(vendorObj[type].length != 0){
                            
                            switch (type){
                                case 'fonts':
                                    
                                    gulp.src(vendorObj[type])
                                        .pipe(_self.outputStream(bundle.bundle.fonts)());
                                    break;
                                case 'images':
                                    gulp.src(vendorObj[type])
                                        .pipe(_self.outputStream(bundle.bundle.images)());
                                    break;
                                case 'json':
                                    gulp.src(vendorObj[type])
                                        .pipe(_self.outputStream(bundle.bundle.json)());
                                    break;
                                case 'media':
                                    gulp.src(vendorObj[type])
                                        .pipe(_self.outputStream(bundle.bundle.media)());
                                    break;
                            }
                        }
                        
                    }
                }
                
            }
            if(!('styles' in bundle.src) && !('scripts' in bundle.src)){
                var src = {
                    styles: [],
                    scripts: []
                };
                _self.objectBuildTree(bundle.src, function(paths, type){
                    switch(type) {
                        case 'styles':
                        case 'scripts':
                            src[type] = src[type].concat(paths);
                            break;
                    }
                });
                
                bundle.src = src;
                
            }
            


            

            for (var type in bundle.src){
                if(!bundle.src.hasOwnProperty(type)) continue;
                if(Object.prototype.toString.call(bundle.src[type]) !== '[object Array]') continue;
                if(typeof bundle.bundle[type] === 'undefined') continues;
                _self.streamPaths(bundle.src[type]);
                var outputFile = _self.baseName(bundle.bundle[type]);

                if(bundle.src[type].length != 0){
                    
                    switch(type){
                        
                        case 'styles':
                            gulp.src(bundle.src[type])
                                .pipe(_self.cssRewritePaths(bundle.bundle[type])())
                                .pipe(concat(outputFile))
                                .pipe(sourcemaps.init())
                                .pipe(sassGlob())
                                .pipe(sass({
                                    errLogToConsole: true
                                }).on('error', sass.logError))
                                .pipe(_self.cssOutput()())
                                .pipe(_self.outputStream(bundle.bundle[type], outputFile)());
                                
                            break;
                        case 'scripts':
                            gulp.src(bundle.src[type])
                                .pipe(concat(outputFile))
                                .pipe(_self.jsOutput()())
                                .pipe(_self.outputStream(bundle.bundle[type], outputFile)())
                                .pipe(livereload());
                        default:
                            break;
                    }
                }
                
            }
        }
        return tasks;
    },
    output: function (bundle) {
        var _self = this;
        if(typeof bundle.src !== 'undefined' && typeof bundle.bundle !== 'undefined'){
            for(var type in bundle.src) {
                if(!bundle.src.hasOwnProperty(type)) continue;
                _self.streamPaths(bundle.src[type]);
                switch(type) {
                    case 'styles':
                        gulp.src(bundle.src[type])
                            .pipe(sassGlob())
                            .pipe(sass({
                                errLogToConsole: true
                            }).on('error', sass.logError))
                            .pipe(_self.outputStream(bundle.output[type])());
                        break;
                    default:
                        gulp.src(bundle.src[type])
                            .pipe(_self.outputStream(bundle.output[type])());
                        break;
                }
            }
        }
    }, 
    getDirs: function(dir) {
        return fs.readdirSync(dir)
            .filter(function(file){
                return fs.statSync(path.join(dir, file)).isDirectory();
            })
    },
    formatOutput: function(_ref){
        var inputPath = _ref.inputPath,
            outputPath = _ref.outputPath;
        // prettify the generated hbs file
        gulp.src(inputPath).pipe(prettify({
            indent_handlebars: true,
            end_with_newlines: true,
            max_preserve_newlines: 0,
            brace_style: 'expand',
            indent_char: '  ',
            indent_size: 2
        })).pipe(gulp.dest(outputPath, {
            overwrite: true
        }))
    },
    fillProperties: function (_ref2){
        var _self = this;
        var groups = _ref2.groups,
            seedOnly = _ref2.seedOnly,
            parent = _ref2.parent,
            result = [];
        
        if(groups === undefined){
            return groups;
        }

        groups.forEach(function(group){
            group.text = group.text || group.title;
            group.tags = group.tags || "";
            if(parent === undefined){
                group.tags = "".concat((group.title + " " + group.text).toLowerCase().replace(/[, ]+/g).trim());
                group.i18n = "nav.".concat(group.title.toLowerCase().split(' ').join('_'));
            } else {
                group.tags = "".concat(parent.tags, " ")
                    .concat((group.title + " " + group.text).toLowerCase().replace(/[, ]+/g).trim());
                group.i18n = "".concat(parent.i18n, "_")
                    .concat(group.title.toLowerCase().split(' ').join('_'));
            }
            group.showOnSeed = group.showOnSeed === undefined ? true : group.showOnSeed;
            group.item = _self.fillProperties({
                groups: group.items,
                seedOnly: seedOnly,
                parent: group
            });
            if(!seedOnly || group.showOnSeed){
                result.push(group);
            }
        });
        return result;
    },
    writeNavigation: function(menu, filePath){
        var lines = [];
        lines.push('<ul id="js-nav-menu" class="nav-menu">');
        menu.forEach(function(group){
            if(group.items){
                var groups = group.items.map(function(_ref3){
                    var href = _ref3.href;
                    return path.parse(href).name;
                }).filter(function(e){
                    return e !== "javascript:void(0);";
                });
                group.items.forEach(function(item){
                    var result = item.items && item.items.map(function(_ref){
                        var href = _ref3.href;
                        return path.parse(href).name;
                    }).filter(function (e){
                        return e !== "javascript:void(0);";
                    });
                    if(result){
                        groups = groups.concat(result);
                    }
                });
                lines.push("<li> {{#is pagename \"in\" \"".concat(groups, "\"}} class=\"active open\"{{/is}}>"));
                lines.push("<a href=\"#\" title=\"".concat(group.title, "\" data-filter-tags=\"").concat(group.tags, "\">"));
                lines.push("</a>");
                // the second sub
                lines.push('<ul>');
                lines.push('</ul>');

                lines.push('</li>');
            }
        })
        lines.push('</ul>');
        var dirname = path.dirname(filePath);
        if(!fs.existsSync(dirname)){
            fs.mkdirSync(dirname);
        }
        fs.writeFileSync(filePath, lines.join('\n'));
    }
}