// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require("merge2");
var plugins = require("gulp-load-plugins")();
// var browserify = require("browserify");
// var source = require('vinyl-source-stream');
// var tsify = require("tsify");
var rollup = require("rollup");
var rollupResolve = require('rollup-plugin-node-resolve');
var rollupCss = require('rollup-plugin-css-porter');

var tsProject = ts.createProject("tsconfig.json", {declaration: true});


gulp.task('clean:css', () =>
    gulp.src('dist/**/*.css', { read: false })
    .pipe(plugins.clean())
);

gulp.task('bundle:css', ['clean:css'], () => {
	gulp.src('src/**/*.css')
		// .pipe(plugins.concat('application.css'))
		.pipe(gulp.dest('dist'));
});

gulp.task("build", function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist"))
    ]);
});

gulp.task('default', ["build", "bundle:css"], () => {
    return rollup.rollup({
        input: 'dist/index.js',
        plugins: [
            rollupResolve(),
            require('rollup-plugin-replace')({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            require('rollup-plugin-commonjs')(),
            rollupCss()
        ]
      }).then(bundle => {
        return bundle.write({
            file: 'build/rulematrix.js',
            format: 'iife',
            name: 'rulematrix'
        });
      });
});