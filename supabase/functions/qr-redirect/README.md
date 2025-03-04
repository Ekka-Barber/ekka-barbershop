# QR Code Redirect Function

This edge function handles QR code redirection by:
1. Accepting a QR code ID as a query parameter
2. Looking up the active QR code URL in the database
3. Redirecting the user to the stored URL

## Query Parameters
- `id`: The identifier for the QR code (e.g., 'ekka-barber-qr-1')

## Response
- 302 Redirect to the stored URL if successful
- 400 if QR code ID is missing
- 404 if QR code is not found
- 500 for server errors