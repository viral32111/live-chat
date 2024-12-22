// Import required functions from native packages
import { join, parse } from "path"
import { existsSync, mkdirSync } from "fs"

// Import required third-party packages
import express, { Express } from "express"
import expressSession from "express-session"
import MongoStore from "connect-mongo"
import { getLogger } from "log4js"
import { ObjectId } from "mongodb"
import multer from "multer"

// Import required code from other scripts
import { isProduction, isTest } from "./main"
import { generateUUID } from "./helpers/random"
import MongoDB from "./classes/mongodb"

// Create the logger for this file
const log = getLogger( "express" )

// Extend the Express session data interface to include our properties
declare module "express-session" {
	interface SessionData {
		guestId: ObjectId
		roomId: ObjectId
	}
}

// Sets up a new Express application
export default function() {

	// Fail if the required environment variables are not set & assign them to constants for easier access
	if ( !process.env.EXPRESS_SESSION_SECRET ) throw new Error( "The EXPRESS_SESSION_SECRET environment variable is not set" )
	if ( !process.env.EXPRESS_CLIENT_DIRECTORY ) throw new Error( "The EXPRESS_CLIENT_DIRECTORY environment variable is not set" )
	if ( !process.env.EXPRESS_COOKIE_DOMAIN ) throw new Error( "The EXPRESS_COOKIE_DOMAIN environment variable is not set" )
	if ( !process.env.EXPRESS_COOKIE_SECURE ) throw new Error( "The EXPRESS_COOKIE_SECURE environment variable is not set" )
	const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET
	const EXPRESS_CLIENT_DIRECTORY = process.env.EXPRESS_CLIENT_DIRECTORY
	const EXPRESS_COOKIE_DOMAIN = process.env.EXPRESS_COOKIE_DOMAIN
	const EXPRESS_COOKIE_SECURE = process.env.EXPRESS_COOKIE_SECURE === "true"
	const EXPRESS_TRUSTED_REVERSE_PROXY_ADDRESS = process.env.EXPRESS_TRUSTED_REVERSE_PROXY_ADDRESS // Optional, so no check

	// Create a new Express application
	const expressApp = express()
	log.info( "Initialised the Express app." )

	// Add support for various middlewares for the Express application
	expressApp.use( express.json() )
	const a = expressSession( {
		name: "sessionIdentifier",
		secret: EXPRESS_SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
		store: ( isProduction === true || isTest === true ) ? MongoStore.create( {
			client: MongoDB.Client,
			collectionName: MongoDB.CollectionNames.Sessions,
		} ) : undefined, // Falling back to undefined will use the default in-memory store
		cookie: {
			domain: EXPRESS_COOKIE_DOMAIN,
			path: "/",
			httpOnly: true,
			secure: EXPRESS_COOKIE_SECURE,
			sameSite: "strict"
		}
	} )
	expressApp.use( a )
	log.info( "Setup Express middlewares." )

	// Enable trusting reverse proxies if the environment variable is set
	if ( EXPRESS_TRUSTED_REVERSE_PROXY_ADDRESS !== undefined ) {
		expressApp.set( "trust proxy", EXPRESS_TRUSTED_REVERSE_PROXY_ADDRESS )
		log.info( "Enabled trust reverse proxies on Express." )
	}

	// Disable caching for API route responses - https://stackoverflow.com/a/53240717
	expressApp.set( "etag", false )
	expressApp.use( ( _, response, next ) => {
		response.set( "Cache-Control", "no-store" )
		next()
	} )

	// Log all incoming requests & their responses
	expressApp.use( ( request, response, next ) => {
		response.on( "finish", () => {
			log.debug( `${ request.method } ${ request.path } ${ JSON.stringify( request.body ) } => ${ response.statusCode }` )
		} )

		next()
	} )

	// Serve the client-side files, without caching - https://stackoverflow.com/a/32154882
	expressApp.use( express.static( EXPRESS_CLIENT_DIRECTORY, {
		etag: false,
		maxAge: 600000 // 10 minutes
	} ) )
	log.info( "Setup serving the client-side files." )

	// Setup the multer middleware for file uploading - https://github.com/expressjs/multer#api
	const attachmentsDirectory = join( EXPRESS_CLIENT_DIRECTORY, "attachments" )
	const multerMiddleware = multer( {

		// Enforce limits to prevent abuse
		limits: {
			files: 5, // Amount of files
			parts: 5, // Same as above

			fieldNameSize: 100, // Length of each field name

			fileSize: 1024 * 1024 * 10, // Size of each file (10 MiB)
			fieldSize: 1024 * 1024 * 10, // Same as above
		},

		storage: multer.diskStorage( {

			// Place files in the attachments directory
			destination: ( _, file, callback ) => {
				if ( existsSync( attachmentsDirectory ) !== true ) mkdirSync( attachmentsDirectory ) // Create the directory if it doesn't exist
				callback( null, attachmentsDirectory )
			},

			// Generate a unique file name for each file
			filename: ( _, file, callback ) => {
				const fileName = generateUUID().concat( parse( file.originalname ).ext )
				log.debug( `Generated name '${ fileName }' for uploading file '${ file.originalname }'.` )
				callback( null, fileName )
			}

		} ),

		// Filter potentially dangerous files to be uploaded - https://www.sitepoint.com/mime-types-complete-list/
		fileFilter: ( _, file, callback ) => {
			log.debug( `Filtering uploading file '${ file.originalname }' (${ file.mimetype })...` )

			// Disallow raw binary, application library & executable files
			if (
				file.mimetype.includes( "application/octet-stream" ) === true ||
				file.originalname.endsWith( ".dll" ) === true ||
				file.originalname.endsWith( ".exe" ) === true
			) return callback( null, false )

			// Disallow older windows executable files
			if (
				file.mimetype.includes( "application/x-msdownload" ) === true ||
				file.mimetype.includes( "application/x-msdos-program" )
			) return callback( null, false )

			// Disallow executable scripts
			if (
				file.mimetype.includes( "application/x-bsh" ) === true ||
				file.mimetype.includes( "application/x-sh" ) === true ||
				file.mimetype.includes( "text/x-script.zsh" ) === true ||
				file.mimetype.includes( "text/x-script.sh" ) === true ||
				file.originalname.endsWith( ".sh" ) === true ||
				file.originalname.endsWith( ".ash" ) === true ||
				file.originalname.endsWith( ".zsh" ) === true ||
				file.originalname.endsWith( ".bash" ) === true ||
				file.originalname.endsWith( ".bat" ) === true ||
				file.originalname.endsWith( ".cmd" ) === true
			) return callback( null, false )

			// Everything else is fine
			callback( null, true )

		}
	} )

	// Return the Express app & multer middleware for use in other scripts
	return [ expressApp, multerMiddleware ] as [ Express, multer.Multer ]

}
