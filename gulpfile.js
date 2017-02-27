/* eslint-env node: true, browser: false */

const gulp = require( 'gulp' ),
	del = require( 'del' ),
	concat = require( 'gulp-concat' ),
	eslint = require( 'gulp-eslint' ),
	uglify = require( 'gulp-uglify' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	ghPages = require( 'gulp-gh-pages' ),
	merge = require( 'merge-stream' ),
	browserSync = require( 'browser-sync' ).create();

gulp.task( 'clean:lib', () =>
	del( [ 'lib' ] )
);

gulp.task( 'clean', gulp.parallel( 'clean:lib' ) );

gulp.task( 'build:lib:sync', () =>
	merge(
		gulp.src( [
			'node_modules/jquery/dist/**/*.{js,map}',
			'node_modules/createjs-easeljs/lib/**/*.{js,map}',
			'node_modules/createjs-tweenjs/lib/**/*.{js,map}'
		], { base: 'node_modules' } )
		.pipe( gulp.dest( 'lib' ) ),
		gulp.src( 'MIDI.js/**/*.{js,map}', { base: 'MIDI.js' } )
		.pipe( gulp.dest( 'lib/midi' ) )
	)
);

gulp.task( 'build:lib:concat', () =>
	gulp.src( [
		'node_modules/core-js/client/core.js',
		'node_modules/systemjs/dist/system.src.js',
		'system.config.js'
	] )
	.pipe( sourcemaps.init() )
	.pipe( concat( 'lib.js' ) )
	.pipe( uglify() )
	.pipe( sourcemaps.write( '.' ) )
	.pipe( gulp.dest( 'lib' ) )
);

gulp.task( 'build:lib', gulp.parallel( 'build:lib:sync', 'build:lib:concat' ) );

gulp.task( 'build', gulp.parallel( 'build:lib' ) );

gulp.task( 'lint:eslint', () =>
	gulp.src( [
		'*.{js,json}',
		'js/**/*.{js,json}'
	], { dot: true } )
	.pipe( eslint() )
	.pipe( eslint.format( 'stylish' ) )
	.pipe( eslint.failAfterError() )
);

gulp.task( 'lint', gulp.parallel( 'lint:eslint' ) );

gulp.task( 'watch:lib', () =>
	gulp.watch( [ 'system.config.js' ], gulp.parallel( 'build:lib:concat' ) )
);

gulp.task( 'watch', gulp.parallel( 'watch:lib' ) );

gulp.task( 'webserver:browser-sync', () => {
	browserSync.init( {
		server: '.',
		files: [
			'*.{html,js,json,xml}',
			'{data,images,include,js,lib,style}/**/*'
		]
	} );
} );

gulp.task( 'webserver', gulp.parallel( 'watch', 'webserver:browser-sync' ) );

gulp.task( 'default', gulp.series( 'clean', 'build' ) );

gulp.task( 'deploy:gh-pages', () =>
	gulp.src( [
		'*.{html,js,json,xml}',
		'{data,images,include,js,lib,style}/**/*'
	] )
	.pipe( ghPages() )
);

gulp.task( 'deploy', gulp.parallel( 'deploy:gh-pages' ) );
