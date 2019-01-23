// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require("merge2");
var plugins = require("gulp-load-plugins")();

                                     // or another module (such as `uglify-es` for ES6 support)
var composer = require('gulp-uglify/composer');
let cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

var rollup = require("rollup");
var rollupResolve = require('rollup-plugin-node-resolve');
var rollupCSS = require('rollup-plugin-css-porter');
var commonjs = require('rollup-plugin-commonjs');
var uglifyjs = require('uglify-es'); // can be a git checkout

var minify = composer(uglifyjs, console);
var tsProject = ts.createProject("tsconfig.json", {declaration: true});
var packageInfo = require("./package.json");
var version = packageInfo.version;

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
        .pipe(plugins.concat('rulematrix.development.css'))
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



gulp.task('bundle:js', ["build:ts", "copy:css"], () => {
    return rollup.rollup({
        external: ['d3', 'react', 'react-dom'],
        input: 'dist/index.js',
        plugins: [
            rollupResolve(),
            commonjs({
                include: [
                    'node_modules/**'
                ],
                exclude: [
                    'node_modules/process-es6/**'
                ]
            }),
            require('rollup-plugin-replace')({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            rollupCSS({
                include: ['node_modules/rc-slider/**/*.css', 'dist/**/*.css'],
                dest: 'build/rulematrix.development.css'
            })
        ]
    }).then(bundle => {
        return bundle.write({
            file: 'build/rulematrix.development.js',
            format: 'umd',
            name: 'rulematrix',
            globals,
            exports: 'named',
            banner: '/* rulematrix.js version ' + version + ' */',
            footer: '/* https://github.com/rulematrix/rule-matrix-js */'
        });
    });
});

gulp.task('compress:js', ['bundle:js'], () => {
    return gulp.src('build/rulematrix.development.js')
        .pipe(minify())
        .pipe(rename('rulematrix.production.min.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('compress:css', ['bundle:js'], () => {
    return gulp.src('build/rulematrix.development.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename('rulematrix.production.min.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('test', ["bundle:js", "bundle:css", "copy:data"]);

gulp.task('default', ["bundle:js", "compress:js", "compress:css"]);
