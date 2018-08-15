'use strict';

// GULP================================================
//
const gulp       = require('gulp'),

  // gulp plugins

  changed        = require('gulp-changed'),
  nunjucksRender = require('gulp-nunjucks-render'),
  concat         = require('gulp-concat'),
  uglify         = require('gulp-uglify'),
  cleanCSS       = require('gulp-clean-css'),

  // other plugins
  browsersync    = require('browser-sync'),
  del            = require('del')
;

// PATH CONFIG ========================================
//
let PATH;

PATH = {
  src  : 'src/',
  dest : 'dist/'
};

PATH.css = {
    in  : PATH.src + 'css/*.css',
    out : PATH.dest   + 'css/'
};

PATH.js = {
    in  : PATH.src + 'js/libs/*.js',
    out : PATH.dest   + 'js/libs/'
};


PATH.concat = {
    in  : PATH.src + 'js/modules/',
    out : PATH.dest + 'js/'
}


PATH.html = {
  in  : PATH.src  + '*.html',
  out : PATH.dest + './'
};

PATH.njk = {
  njk : PATH.src + '_templates/**/*.njk',
  in : PATH.src + '_pages/**/*.njk',
  out : PATH.dest + './'
};


const SYNC_CONFIG = {
  port   : 3333,
  browser: "chrome",
  server : {
    baseDir : PATH.dest,

    index : 'index.html'
  },
  open   : true,
  notify : false
};


var NUNJUCKS_DEFAULTS = {
    path: 'src/_templates/'
};

var JS_MODULES = {
    path: 'src/js/modules'
}


gulp.task('css', function() {

    return gulp.src(PATH.css.in)
        //.pipe(changed(PATH.css.out))
        .pipe(cleanCSS())
        .pipe(gulp.dest(PATH.css.out))
    ;
});


gulp.task('concat', function() {
    return gulp.src([
        PATH.concat.in + 'mediator.js',
        PATH.concat.in + 'bookController.js',
        PATH.concat.in + 'booksData.js',
        PATH.concat.in + 'bookCounter.js',
        PATH.concat.in + 'userAuthorizationController.js',
        PATH.concat.in + 'usersData.js',
        PATH.concat.in + 'cookie.js',
        PATH.concat.in + 'userSession.js'
        ])
        .pipe(concat('all.js'))
        .pipe(changed(PATH.concat.out))
        .pipe(gulp.dest(PATH.concat.out))
        ;
});

gulp.task('js', function() {

    return gulp.src(PATH.js.in)

        .pipe(changed(PATH.js.out))
        .pipe(gulp.dest(PATH.js.out))
        ;
});

gulp.task('nunjucks', function() {

    return gulp.src(PATH.njk.in)
        .pipe(changed(PATH.njk.out))
        .pipe(nunjucksRender(NUNJUCKS_DEFAULTS))
        .pipe(gulp.dest(PATH.njk.out))
        ;

});

gulp.task('build',

    [   'css',
        'js',
        'concat',
        'nunjucks'
    ],

    function() {
        console.log('***************************');
        console.log('*** Starting BUILD task ***');
        console.log('***************************');
    }
);

gulp.task('clean', function() {
  del(
    [
      PATH.dest + '*'
    ]
  );
});

gulp.task('browsersync', function() {
    browsersync(SYNC_CONFIG);
});

gulp.task('default', ['browsersync', 'build'], function() {

    // css changes
    gulp.watch(PATH.css.in,    ['css']);

    // js changes

    gulp.watch(PATH.js.in,     ['js', browsersync.reload]);

    gulp.watch(PATH.concat.in,     ['concat', browsersync.reload]);

    gulp.watch(
        [
            PATH.njk.njk,
            PATH.njk.in
        ],                     ['nunjucks', browsersync.reload]);

});
