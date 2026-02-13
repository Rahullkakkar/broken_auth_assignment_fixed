# Broken Authentication Assignment – Fixed

This repository contains a corrected implementation of the intentionally broken authentication flow provided in the assignment.

## Overview
The goal of this assignment was to debug and fix a multi-step authentication system involving login, OTP verification, session handling, JWT generation, and access to a protected route.

## Issues Identified
- Requests were hanging due to a custom logger middleware not calling `next()`.
- OTP verification failed because of incorrect session handling.
- Session information was not consistently validated between endpoints.
- JWT tokens were generated and verified using mismatched secret logic.

## Fixes Implemented
- Fixed the request logger middleware by properly forwarding requests using `next()`.
- Implemented a clean OTP-based login flow with in-memory session storage.
- Ensured OTP verification validates the correct session and sets a session cookie.
- Updated the token generation endpoint to issue JWTs only from valid session cookies.
- Ensured JWT signing and verification use the same secret.
- Verified the protected route correctly validates the bearer token and returns user data.

## Verification
The complete authentication flow was tested end-to-end using curl:
1. Login with email and password
2. Verify OTP
3. Exchange session cookie for JWT
4. Access protected route using the JWT

The full terminal output for all steps, including the final success flag, is available in `output.txt`.