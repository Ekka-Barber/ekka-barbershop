
# QR Code Redirect Function

This edge function handles QR code redirection by:
1. Accepting a QR code ID as a query parameter
2. Looking up the active QR code URL in the database
3. Redirecting the user to the stored URL

## Query Parameters
- `id`: The identifier for the QR code (e.g., 'ekka-barber-qr-1')

## Authentication
The function supports three authentication methods in order of preference:
1. Bearer token in Authorization header (preferred method)
2. API key as query parameter (`apikey`)
3. Default anonymous key (fallback)

## Response
- 302 Redirect to the stored URL if successful
- 400 if QR code ID is missing
- 404 if QR code is not found or inactive
- 500 for server errors

## Improved Logging
The function includes comprehensive logging to help debug issues:
- Request URL and headers
- User agent information
- Authentication method used
- Database query details
- Redirect outcomes

## Important Notes
- Mobile browsers and QR code scanners should work without any special configuration
- For testing purposes, you can access the QR redirect directly in a browser
