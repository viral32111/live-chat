// Import Express app from the main script
import { expressApp } from "../main"

// Browsers love to repeatedly request the favicon, so we'll just tell them to stop
expressApp.get( "/favicon.ico", ( _, response ) => {
	response.status( 410 ).end()
} )
