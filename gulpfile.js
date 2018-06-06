/* eslint-env node: true, browser: false */

const gulp = require( 'gulp' ),
	del = require( 'del' ),
	concat = require( 'gulp-concat' ),
	eslint = require( 'gulp-eslint' ),
	htmlhint = require( 'gulp-htmlhint' ),
	uglify = require( 'gulp-uglify' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	merge = require( 'merge-stream' ),
	browserSync = require( 'browser-sync' ).create();

function watch( paths, types, callback ) {
	if( typeof types === 'string' ) types = types.trim().split( /\s+/g );
	const watcher = gulp.watch( paths );
	for( const type of types ) {
		watcher.on( type, path => { callback( path, type ); } );
	}
	return watcher;
}

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
		'.htmlhintrc',
		'js/**/*.{js,json}'
	], { dot: true } )
	.pipe( eslint() )
	.pipe( eslint.format( 'stylish' ) )
	.pipe( eslint.failAfterError() )
);

gulp.task( 'lint:htmlhint', () =>
	gulp.src( [ '*.html' ] )
	.pipe( htmlhint( '.htmlhintrc' ) )
	.pipe( htmlhint.reporter( 'htmlhint-stylish' ) )
	.pipe( htmlhint.failReporter( { suppress: true } ) )
);

gulp.task( 'lint', gulp.parallel( 'lint:eslint', 'lint:htmlhint' ) );

gulp.task( 'watch:lint:eslint', () =>
	watch( [
			'*.{js,json}',
			'.htmlhintrc',
			'js/**/*.{js,json}'
		], 'add change',
		path =>
			gulp.src( path, { dot: true } )
			.pipe( eslint() )
			.pipe( eslint.format( 'stylish' ) )
	)
);

gulp.task( 'watch:lint:htmlhint', () =>
	watch( [ '*.html' ], 'add change',
		path =>
			gulp.src( path, { dot: true } )
			.pipe( htmlhint( '.htmlhintrc' ) )
			.pipe( htmlhint.reporter( 'htmlhint-stylish' ) )
	)
);

gulp.task( 'watch:lint', gulp.parallel( 'watch:lint:eslint', 'watch:lint:htmlhint' ) );

gulp.task( 'watch:lib', () =>
	gulp.watch( [ 'system.config.js' ], gulp.parallel( 'build:lib:concat' ) )
);

gulp.task( 'watch', gulp.parallel( 'watch:lint', 'watch:lib' ) );

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
