var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var stripDebug = require('gulp-strip-debug');
var ejs = require('gulp-ejs');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');
var del = require('del');
//var jsdoc = require('gulp-jsdoc');
//

const outputDir = './dist';

gulp.task('clean-js', function(){
  return del([
    outputDir
  ]);
});

gulp.task('sdk', ['clean-js'], function(){
  return gulp.src([
      './src/ts/**/*.ts',
    ])
    .pipe(plumber())
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(outputDir))
});

gulp.task('html', function(){
  return gulp.src(['./src/html/**/*.html', '!./ejs/_*.html'])
    .pipe(plumber())
    .pipe(ejs({}))
    .pipe(gulp.dest(outputDir))
});

gulp.task('build', ['sdk', 'html']);

gulp.task('develop', ['sdk', 'html'], function(){
  watch([
    './src/ts/**/*.ts'
  ],function(){
    gulp.start(['sdk']);
  });

  watch([
    './src/html/**/*.html'
  ],function(){
    gulp.start(['html']);
  });
});

gulp.task('default', function(){
  var spawn = function(){
    var proc = require('child_process').spawn('gulp', ['develop'], {stdio: 'inherit'});
    proc.on('close', function(c){
      spawn();
    });
  };
  spawn();
});
