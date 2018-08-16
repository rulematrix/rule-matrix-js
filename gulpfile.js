// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require("merge2");
var plugins = require("gulp-load-plugins")();
// var browserify = require("browserify");
// var babelify = require("babelify");
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

gulp.task('copy:css', ['clean:css'], () => 
	gulp.src('src/**/*.css')
		.pipe(gulp.dest('dist'))
);

gulp.task('bundle:css', ['copy:css'], () => 
    gulp.src('dist/**/*.css')
        .pipe(plugins.concat('rulematrix.css'))
		.pipe(gulp.dest('build'))
);

gulp.task('clean:ts', () =>
    gulp.src(['dist/**/*.js', 'dist/**/*.d.ts'], { read: false })
    .pipe(plugins.clean())
);

gulp.task('build:ts', ['clean:ts'], () => {
    var tsResult = tsProject.src()
        .pipe(tsProject());
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist"))
    ]);
});


gulp.task('copy:data', () => 
	merge([
        gulp.src('src/**/*.json')
            .pipe(gulp.dest('build')),
        gulp.src('public/test.html')
            .pipe(gulp.dest('build'))
    ])
);

var globals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'd3': 'd3'
};

gulp.task('bundle:ts', ["build:ts", "copy:css"], () => {
    return rollup.rollup({
        external: ['react', 'react-dom', 'd3'],
        input: 'dist/index.js',
        plugins: [
            rollupResolve(),
            require('rollup-plugin-commonjs')(),
            require('rollup-plugin-replace')({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            rollupCss()
        ]
      }).then(bundle => {
        return bundle.write({
            file: 'build/rulematrix.js',
            format: 'umd',
            name: 'rulematrix',
            globals,
            exports: 'named'
        });
      });
});

// gulp.task('bundle:ts', ["build:ts", "copy:css", "copy:data"], () => {
//     return browserify({
//         entries: ["./dist/app.js"],
//         debug: false,
//     })
//     .ignore(['react', 'react-dom'])
//     // .external(['react', 'react-dom', 'd3'])
//     .transform('browserify-css', {
//         // minify: true,
//         output: 'rulematrix.css'
//     })
//     // .transform(babelify, {presets: ["es2015"], extensions: ['.tsx', '.ts']})
//     .bundle()
//     .pipe(source("rulematrix.js"))
//     .pipe(gulp.dest("./build"))
//     ;
// });

gulp.task('default', ["bundle:ts", "bundle:css"]);