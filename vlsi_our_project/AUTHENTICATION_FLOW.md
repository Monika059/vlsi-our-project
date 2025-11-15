# Authentication Flow - AI-powered VLSI Design Assistant

## 🔐 Google OAuth 2.0 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

1. USER VISITS APPLICATION
   │
   ├─> http://localhost:5173
   │
   └─> App checks authentication status (AuthProvider useEffect)
       │
       ├─> Checks localStorage for existing user and token
       │   ├─> If token exists → Validates expiration time
       │   └─> If valid → Sets user state and isAuthenticated = true
       │
       ├─> If authenticated → Redirect to /dashboard
       │
       └─> If not authenticated → Show Login Page


2. LOGIN PAGE DISPLAYED
   │
   ├─> Shows "AI-powered VLSI Design Assistant" branding
   ├─> Displays feature highlights and benefits
   └─> Shows "Sign in with Google" button (GoogleLogin component)


3. USER CLICKS "SIGN IN WITH GOOGLE"
   │
   ├─> @react-oauth/google library triggered
   │
   └─> Redirects to Google OAuth consent screen
       │
       └─> URL: https://accounts.google.com/o/oauth2/v2/auth
           Parameters:
           - client_id: VITE_GOOGLE_CLIENT_ID from environment
           - redirect_uri: http://localhost:5173
           - response_type: token
           - scope: openid profile email


4. GOOGLE AUTHENTICATION
   │
   ├─> User selects Google account
   ├─> User grants permissions (if first time)
   │
   └─> Google validates credentials


5. GOOGLE RETURNS CREDENTIAL
   │
   ├─> Success: Returns JWT credential token to handleGoogleSuccess callback
   │   │
   │   └─> Token contains:
   │       - sub: User ID
   │       - email: User email
   │       - name: User name
   │       - picture: Profile picture URL
   │       - exp: Expiration time
   │
   └─> Failure: handleGoogleError callback triggered


6. FRONTEND PROCESSES CREDENTIAL
   │
   ├─> handleGoogleSuccess calls AuthContext.login(credential)
   │
   ├─> jwt-decode library decodes the token
   │
   ├─> Extracts user information:
   │   - email
   │   - name
   │   - picture
   │   - sub (user ID)
   │
   ├─> Stores in state: setUser(userData)
   │
   └─> Stores in localStorage:
       - localStorage.setItem('user', JSON.stringify(userData))
       - localStorage.setItem('token', credential)


7. REDIRECT TO DASHBOARD
   │
   ├─> navigate('/dashboard') called in handleGoogleSuccess
   │
   └─> ProtectedRoute component checks authentication
       │
       ├─> If isAuthenticated → Render Dashboard component
       │
       └─> If not authenticated → Navigate to "/" (LoginPage)


8. DASHBOARD DISPLAYED
   │
   ├─> Header shows user profile picture and name
   ├─> Welcome message: "Welcome back, [Name]!"
   ├─> Full access to all features:
   │   - Code Editor
   │   - Analysis
   │   - Debugging
   │   - Optimization
   │   - Simulation
   └─> Logout button available


9. SESSION PERSISTENCE
   │
   ├─> On page reload:
   │   │
   │   ├─> AuthContext checks localStorage
   │   │
   │   ├─> Retrieves stored user and token
   │   │
   │   ├─> Validates token expiration
   │   │   │
   │   │   ├─> If valid → Restore session
   │   │   │
   │   │   └─> If expired → Clear storage, redirect to login
   │   │
   │   └─> User remains logged in
   │
   └─> Token automatically expires after Google's set time


10. LOGOUT PROCESS
    │
    ├─> User clicks "Logout" button
    │
    ├─> AuthContext.logout() called
    │
    ├─> Clears state: setUser(null)
    │
    ├─> Clears localStorage:
    │   - localStorage.removeItem('user')
    │   - localStorage.removeItem('token')
    │
    └─> Redirects to / (Login Page)


┌─────────────────────────────────────────────────────────────────────┐
│                     COMPONENT INTERACTION                            │
└─────────────────────────────────────────────────────────────────────┘

App.tsx
  │
  ├─> GoogleOAuthProvider (wraps entire app)
  │   │
  │   └─> Provides Google Client ID
  │
  ├─> AuthProvider (manages auth state)
  │   │
  │   ├─> Provides: user, login, logout, isAuthenticated
  │   │
  │   └─> Used by: LoginPage, Dashboard, Header, ProtectedRoute
  │
  └─> Router (handles navigation)
      │
      ├─> Route: / → LoginPage
      │   │
      │   └─> GoogleLogin component
      │       │
      │       ├─> onSuccess → login(credential)
      │       │
      │       └─> onError → console.error()
      │
      ├─> Route: /dashboard → ProtectedRoute
      │   │
      │   └─> Checks isAuthenticated
      │       │
      │       ├─> True → Render Dashboard
      │       │
      │       └─> False → Navigate to /
      │
      └─> Route: * → Navigate to /


┌─────────────────────────────────────────────────────────────────────┐
│                     SECURITY FEATURES                                │
└─────────────────────────────────────────────────────────────────────┘

✅ OAuth 2.0 Standard
   - Industry-standard authentication protocol
   - No password handling by our application

✅ JWT Token Validation
   - Tokens are signed by Google
   - Expiration time checked
   - Tamper-proof

✅ HTTPS in Production
   - All OAuth flows require HTTPS in production
   - Protects token transmission

✅ Client-Side Storage
   - Tokens stored in localStorage
   - Cleared on logout
   - Validated on each page load

✅ Protected Routes
   - Dashboard only accessible when authenticated
   - Automatic redirect if not logged in

✅ No Backend Authentication Required
   - Frontend-only authentication
   - Backend can verify tokens if needed (future enhancement)


┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING                                   │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: Google Login Fails
  │
  ├─> onError callback triggered
  ├─> Error logged to console
  └─> User remains on login page

Scenario 2: Token Expired
  │
  ├─> Detected on page reload
  ├─> localStorage cleared
  └─> User redirected to login

Scenario 3: Invalid Token
  │
  ├─> jwt-decode throws error
  ├─> Caught in try-catch
  ├─> localStorage cleared
  └─> User redirected to login

Scenario 4: Network Error
  │
  ├─> Google OAuth may fail to load
  ├─> User sees error in console
  └─> Retry by refreshing page


┌─────────────────────────────────────────────────────────────────────┐
│                     CONFIGURATION CHECKLIST                          │
└─────────────────────────────────────────────────────────────────────┘

Backend (.env):
  ☐ OPENAI_API_KEY set
  ☐ PORT set to 5000
  ☐ ALLOWED_ORIGINS includes http://localhost:5173

Frontend (.env):
  ☐ VITE_GOOGLE_CLIENT_ID set with actual Client ID

Google Cloud Console:
  ☐ OAuth 2.0 Client ID created
  ☐ Authorized JavaScript origins: http://localhost:5173
  ☐ Authorized redirect URIs: http://localhost:5173
  ☐ OAuth consent screen configured
  ☐ Test users added (for development)

Application:
  ☐ Dependencies installed (npm install)
  ☐ Backend running on port 5000
  ☐ Frontend running on port 5173
  ☐ Browser allows third-party cookies


┌─────────────────────────────────────────────────────────────────────┐
│                     TESTING THE FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

Test 1: Fresh Login
  1. Clear browser localStorage
  2. Visit http://localhost:5173
  3. Should see login page
  4. Click "Sign in with Google"
  5. Select Google account
  6. Should redirect to dashboard
  7. Should see welcome message with your name

Test 2: Session Persistence
  1. After logging in, refresh the page
  2. Should remain on dashboard
  3. Should not need to login again

Test 3: Logout
  1. Click "Logout" button in header
  2. Should redirect to login page
  3. localStorage should be cleared
  4. Trying to access /dashboard should redirect to /

Test 4: Protected Routes
  1. Logout if logged in
  2. Try to access http://localhost:5173/dashboard directly
  3. Should redirect to login page
  4. After login, should go to dashboard

Test 5: Token Expiration
  1. Login successfully
  2. Manually edit localStorage token to have expired time
  3. Refresh page
  4. Should redirect to login (token invalid)


┌─────────────────────────────────────────────────────────────────────┐
│                     TROUBLESHOOTING                                  │
└─────────────────────────────────────────────────────────────────────┘

Problem: Google button not appearing
Solution:
  - Check VITE_GOOGLE_CLIENT_ID in frontend/.env
  - Verify Client ID format (ends with .apps.googleusercontent.com)
  - Check browser console for errors
  - Ensure @react-oauth/google is installed

Problem: "Redirect URI mismatch" error
Solution:
  - Go to Google Cloud Console → Credentials
  - Edit OAuth 2.0 Client ID
  - Add http://localhost:5173 to Authorized redirect URIs
  - Save and try again

Problem: User logged out unexpectedly
Solution:
  - Check token expiration time
  - Google tokens typically expire after 1 hour
  - User will need to login again

Problem: "Access blocked" error from Google
Solution:
  - OAuth consent screen not configured
  - Add your email as test user
  - Or publish the OAuth consent screen

Problem: CORS errors
Solution:
  - Ensure backend ALLOWED_ORIGINS includes http://localhost:5173
  - Restart backend server
  - Clear browser cache
```

## 🔑 Key Files for Authentication

1. **frontend/src/contexts/AuthContext.tsx**
   - Manages authentication state
   - Provides login/logout functions
   - Handles session persistence

2. **frontend/src/pages/LoginPage.tsx**
   - Login UI with Google button
   - Handles OAuth callbacks
   - Redirects after successful login

3. **frontend/src/App.tsx**
   - Sets up GoogleOAuthProvider
   - Configures protected routes
   - Manages routing

4. **frontend/src/components/Header.tsx**
   - Displays user profile
   - Logout button
   - User information

5. **frontend/.env**
   - Stores Google Client ID
   - Must not be committed to git

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [JWT.io - Token Decoder](https://jwt.io/)
- [React Router Documentation](https://reactrouter.com/)

---

**Built by Hack Nova Team** 🚀
