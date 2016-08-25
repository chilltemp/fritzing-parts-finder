var path = require('path');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var tslint = require('gulp-tslint');
var clean = require('gulp-clean');
var rename = require('gulp-rename');

gulp.task('clean', () => {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('copy', ['clean'], () => {
  return gulp.src('src/**/*.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('vet', function () {
  return tsProject.src()
    .pipe(tslint({
      formatter: 'prose'
    }));
});

gulp.task('build', ['clean'], function () {
  return tsProject.src()
    .pipe(ts(tsProject))
    .js
    .pipe(rename((filePath) => {
      filePath.dirname = leftTrimPath('src', filePath.dirname);
      return filePath;
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'vet', 'copy', 'build']);

function leftTrimPath(basePath, actualPath) {
  if(!basePath || !basePath.length) {
    return basePath;
  }

  var pathSlash = basePath + path.sep;
  if(actualPath === basePath || actualPath === pathSlash) {
    return '';
  }

  if(actualPath.indexOf(pathSlash) === 0) {
    return actualPath.substring(pathSlash.length);
  }

  return actualPath;
}
