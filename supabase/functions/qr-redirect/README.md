
# QR Code Redirect Function

This edge function handles QR code redirection by:
1. Accepting a QR code ID as a query parameter
2. Looking up the active QR code URL in the database
3. Redirecting the user to the stored URL

## Query Parameters
- `id`: The identifier for the QR code (e.g., 'ekka-barber-qr-1')

## Authentication
This function uses the Supabase service role key for database operations with no client-side authentication required.
QR codes are publicly accessible without requiring authentication, making them work in any browser or QR scanner.

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
- QR codes are publicly accessible with no authorization required
- Mobile browsers and QR code scanners will work without any configuration
- The function uses Supabase service role key internally for database access
