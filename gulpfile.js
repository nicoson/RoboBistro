var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch');
 
gulp.task('Less', function () {
    return gulp.src('./public/stylesheets/*.less')
        .pipe(less())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('AutoLess', function () {
	// Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event 
    return watch('./public/stylesheets/*.less', function () {
        gulp.src('./public/stylesheets/*.less')
        .pipe(less())
        .pipe(gulp.dest('./public/stylesheets'));
    });
});

gulp.task('default', ['Less']);
gulp.task('watch', ['AutoLess']);