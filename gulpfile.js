var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var path = require('path');

var paths = {
    es6: ['lib/**/*.js'],
    es5: 'lib_es5',
    // Must be absolute or relative to source map
    sourceRoot: path.join(__dirname, 'es6'),
};

var child_exec = require('child_process').exec;

gulp.task('docs', function(done) {
//    child_exec('node ./node_modules/jsdoc/jsdoc.js ./lib -c ./jsdoc.json', undefined, done);
    child_exec('node ./node_modules/jsdoc/jsdoc.js -c ./jsdoc_conf.json', undefined, done);
});


gulp.task('babel', function () {
    return gulp.src(paths.es6)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot }))
        .pipe(gulp.dest(paths.es5));
});


gulp.task('watch', function() {
    gulp.watch(paths.es6, ['babel']);
});


gulp.task('default', ['watch']);
