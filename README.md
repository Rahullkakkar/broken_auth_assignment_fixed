# Broken Auth Assignment — Fixed

## Fix Summary

This repository contains a fixed version of the intentionally broken authentication API.

### What was broken
- Requests were hanging due to a custom logger middleware not calling `next()`.
- OTP verification and session handling were inconsistent.
- Token generation incorrectly looked at headers and not cookies.
- JWT signing and verification used mismatched secret logic.

### What was fixed
- Added `next()` to the logger middleware to avoid request blocking.
- Corrected OTP and session cookie handling with proper in-memory storage.
- Adjusted the `/auth/token` endpoint to use session cookies correctly.
- Ensured JWT is issued and verified using the same secret.
- Fixed protected route middleware to validate bearer token correctly.

## How to test
After starting the server with `npm start`:
1. Run the four commands for Login, OTP, Token, and Protected route.
2. See the outputs in `output.txt`.
3. The final command returns a `success_flag`.