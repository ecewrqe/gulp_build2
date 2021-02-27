var toc = require('toc')
    // var toc = require('gulp-toc');
var markdown = require('helper-markdown');



module.exports.register = function(handlebars) {
    handlebars.registerHelper('markdown', markdown());
    handlebars.registerHelper('toc', function(options) {
        /*
        *
        * option.data.markdown_toc*/
            var str = options.fn(this);
            res = toc.process(String(str));
            return res;
        })
        // handlebars.registerHelper('toc', toc)


};