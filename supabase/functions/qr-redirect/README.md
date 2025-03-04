
# QR Code Redirect Function

This edge function handles QR code redirection by:
1. Accepting a QR code ID as a query parameter
2. Looking up the active QR code URL in the database
3. Redirecting the user to the stored URL

## Query Parameters
- `id`: The identifier for the QR code (e.g., 'ekka-barber-qr-1')

## Authentication
The function now uses the Supabase service role key for internal database operations, 
allowing it to bypass Row Level Security (RLS) policies. This means no authentication 
is required from the client side when scanning QR codes.

## Response
- 302 Redirect to the stored URL if successful
- 400 if QR code ID is missing
- 404 if QR code is not found or inactive
- 500 for server errors

## Improved Logging
The function includes comprehensive logging to help debug issues:
- Request URL
- User agent information
- Database query details
- Redirect outcomes

## Important Notes
- QR codes are now publicly accessible without requiring an API key
- Mobile browsers and QR code scanners should work without any special configuration
- For testing purposes, you can access the QR redirect directly in a browser
