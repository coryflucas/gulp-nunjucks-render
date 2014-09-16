'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var nunjucks = require('nunjucks');

module.exports = function (options) {
	options = options || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-nunjucks', 'Streaming not supported'));
			return cb();
		}

		try {
			var context = options;
			if(options.context) {
				context = options.context;
			}

			context.name = typeof context.name === 'function' && context.name(file) || file.relative;

			if(!options.reuseEnv) {
				file.contents = new Buffer(nunjucks.renderString(file.contents.toString(), context));
			} else {
				var env = new nunjucks.configure({ watch: false });
				file.contents = new Buffer(env.renderString(file.contents.toString(), context));
			}
			file.path = gutil.replaceExtension(file.path, '.html');

		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-nunjucks', err));
		}

		this.push(file);
		cb();
	});
};

module.exports.nunjucks = nunjucks;
