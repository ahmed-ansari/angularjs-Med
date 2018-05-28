//=================================================
// Load Gulp Modules (Build Routines)
//=================================================
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    changed = require('gulp-changed'),
    express = require('express'),
    watch = require('watchify'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del = require('del');
    // replace = require('gulp-replace');

//=================================================
// Key Tasks
//=================================================
gulp.task('play', function() {
    runSequence('styles', 'views', 'lang', 'images', 'fonts', 'resouces', 'data', 'js', 'lint', 'watch', 'start');
});
gulp.task('SET_QA_ALL', ['SET_QA_1', 'SET_QA_2']);
gulp.task('SET_DEV_ALL', ['SET_DEV_1', 'SET_DEV_2']);

gulp.task('init', ['styles', 'views', 'images', 'fonts', 'resources', 'lang', 'data', 'js', 'lint', 'watch',  'start']);
gulp.task('default', ['clean', 'play']);
    
//=================================================
// Start Activities
//=================================================
gulp.task('start', function() {
    console.log('Gulp Build :: STARTED');
});

//=================================================
// Concatenation of All JS Files
//=================================================
gulp.task('js', function() {
    var stream = gulp.src([
            'assets/js/jquery.min.js',
            'assets/js/ionic.min.js',
            'assets/js/ionic.bundle.min.js',
            'assets/js/angular.min.js',
            'assets/js/angular-ui-router.js',
            'assets/js/ionic-angular.min.js',
            'assets/js/forceng.js',
            'assets/js/angular-translate.min.js',
            'assets/js/angular-translate-loader-static-files.min.js',
            'assets/js/angular-animate.min.js',
            'assets/js/ui-bootstrap-tpls-0.13.0.js',
            'assets/js/moment.js',
            'assets/js/fullcalendar.min.js',
            'assets/js/gcal.js',
            'assets/js/calendar.js',
            'assets/js/tmhDynamicLocale.min.js',
            'assets/js/locales.min.js',
            'assets/js/angular-cookies.min.js',
            'assets/js/angular-translate-storage-cookie.min.js',
            'assets/js/angular-translate-storage-local.min.js',
            'assets/js/angular-messages.min.js',
            'assets/js/angular-toastr.tpls.min.js',
            'assets/js/angular-material.min.js',
            'assets/js/angular-aria.min.js',
            'assets/js/angular-toastr.tpls.min.js',
            'assets/js/angucompleteAlt.js',
            'assets/js/signature_pad.min.js',
            'assets/js/signature.js',
            'assets/js/ng-map.min.js',
            'assets/js/tabSlideBox.js',
            'assets/js/angular-local-storage.js',
            'assets/js/google_loader.js',
            'assets/js/app.js',
            'modules/**/*Controller.js',
            'modules/**/*Directive.js',
            'modules/**/*Services.js'
        ])
        .pipe(concat('jsComponents.js'))
        .pipe(gulp.dest('www/assets/js'))
        .pipe(gulp.dest('platforms/ios/www/assets/js'));
    return stream;
});

//=================================================
// Lint All JS's Files
//=================================================
gulp.task('lint', function() {
    return gulp.src(['modules/**/*.js', 'assets/js/app.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint({"-W100": true}));
        // .pipe(jshint({"eqnull":false,"globals":['$']}))
        // .pipe(jshint.reporter('default'));
});

//=================================================
// Copying Views
//=================================================
gulp.task('views', function() {
    gulp.src('modules/**/*.html')
        .pipe(gulp.dest('www/modules'))
        .pipe(gulp.dest('platforms/ios/www/modules'));
    return gulp.src('index.html')
        .pipe(gulp.dest('www'))
        .pipe(gulp.dest('platforms/ios/www'));
});

//=================================================
// SASS Styles
//=================================================
gulp.task('styles', function() {
    return gulp.src('assets/scss/main.scss')
        .pipe(sass({
            outputStyle: 'nested' 
        }))
        .on('error', sass.logError)
        .pipe(gulp.dest('www/assets/css/'))
        .pipe(gulp.dest('platforms/ios/www/assets/css'));
});

//=================================================
// LANGUAGE Translation Resource
//=================================================
gulp.task('lang', function() {
    return gulp.src('assets/resources/**.json')
        .pipe(gulp.dest('www/assets/resources'))
        .pipe(gulp.dest('platforms/ios/www/assets/resources'));
});

//=================================================
// Images
//=================================================
gulp.task('images', function() {
    return gulp.src('assets/images/**/*')
        .pipe(changed('www/assets/images')) 
        .pipe(gulp.dest('www/assets/images'));
});

//=================================================
// Font
//=================================================
gulp.task('fonts', function() {
    return gulp.src('assets/font/**/*')
        .pipe(gulp.dest('www/assets/font'));
});

//=================================================
// Resources
//=================================================
gulp.task('resources', function() {
    return gulp.src('assets/resources/**/*')
        .pipe(gulp.dest('www/assets/resources'));
});

//=================================================
// Data
//=================================================
gulp.task('data', function() {
    var stream = gulp.src(['./assets/data/**'])
        .pipe(gulp.dest('www/assets/data'));
    return stream;
});

//=================================================
// Server
//=================================================
gulp.task('server', function() {
    var app = express();
    var port = parseInt(process.env.PORT, 10) || 2045;
    app.use(express.static('www'));
    console.log("Simple static server listening at http://localhost:" + port);
    app.listen(port);
});

//=================================================
// Browser Sync
//=================================================
gulp.task('browserSync', function() {
    browserSync({
        proxy: 'localhost:2045',
        notify: true
    });
});

//=================================================
// Reload
//=================================================
gulp.task('reload', function() {
    console.log('reloading **************************************');
    browserSync.reload();
});

//=================================================
// Build Parameters to SFDC QA Instance
//=================================================
gulp.task('SET_QA_BASE', function(){
  return gulp.src(['modules/**/*'])
    .pipe(replace('MedConnectDev__', 'MedConnect__'))
    .pipe(gulp.dest('modules'));
});

gulp.task('SET_QA_1', function(){
  return gulp.src(['modules/**/*'])
    .pipe(replace('MedConnectDev/', ''))
    .pipe(gulp.dest('modules'));
});

gulp.task('SET_QA_2', function(){
  return gulp.src(['assets/data/medvantageConfig.json'])
    .pipe(replace('MedConnectDev__', 'MedConnect__'))
    .pipe(gulp.dest('assets/data'));
});

//=================================================
// Build Parameters to SFDC DEV Instance
//=================================================
gulp.task('SET_DEV_BASE', function(){
  return gulp.src(['modules/**/*'])
    .pipe(replace('MedConnect__', 'MedConnectDev__'))
    .pipe(gulp.dest('modules'));
});

gulp.task('SET_DEV_1', function(){
  return gulp.src(['modules/**/*'])
    .pipe(replace('/services/apexrest/', '/services/apexrest/MedConnectDev/'))
    .pipe(gulp.dest('modules'));
});

gulp.task('SET_DEV_2', function(){
  return gulp.src(['assets/data/medvantageConfig.json'])
    .pipe(replace('MedConnect__', 'MedConnectDev__'))
    .pipe(gulp.dest('assets/data'));
});

//=================================================
// Clean
//=================================================
gulp.task('clean', function() {
    del(['www']);
});

//=================================================
// Watch
//=================================================
gulp.task('watch', ['browserSync', 'server'], function() {
    gulp.watch(['modules/**/*.js', 'assets/js/app.js','assets/js/angucompleteAlt.js'], ['lint', 'js', 'reload']);
    gulp.watch(['assets/scss/_theme.scss', 'assets/scss/main.scss', 'assets/scss/**/*.scss','modules/**/*.scss'], ['styles', 'reload']);
    gulp.watch('assets/images/**/*', ['images', 'reload']);
    gulp.watch('assets/resources/**/*', ['resources', 'reload']);
    gulp.watch('assets/resources/*', ['lang', 'reload']);
    gulp.watch(['index.html', 'modules/**/*.html'], ['views', 'reload']);
});