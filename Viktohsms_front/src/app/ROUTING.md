# SMS Legit - Routing Structure

## Overview
The application uses **React Router v6** for client-side routing with proper route separation and protected routes.

## Route Structure

### Public Routes
These routes are accessible without authentication:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Main landing page with hero, features, pricing, etc. |
| `/signin` | `SignInPage` | User sign-in form |
| `/signup` | `SignUpPage` | User registration form |
| `/reset-password` | `ResetPasswordPage` | Password reset flow |

### Protected Routes
These routes require authentication (redirects to `/signin` if not authenticated):

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `CountrySelectionPage` | Select country for phone number |
| `/dashboard/numbers/:countryId` | `NumberSelectionPage` | Select available numbers for country |
| `/dashboard/active/:numberId` | `ActiveNumberPage` | View active number and receive SMS |

## Route Protection

### Authentication Flow
1. Unauthenticated users trying to access `/dashboard/*` routes are redirected to `/signin`
2. Authenticated users trying to access `/signin` or `/signup` are redirected to `/dashboard`
3. After successful sign-in/sign-up, users are redirected to `/dashboard`

### Navigation Flow
```
Landing (/) 
  → Sign In (/signin)
    → Dashboard (/dashboard)
      → Numbers (/dashboard/numbers/:countryId)
        → Active Number (/dashboard/active/:numberId)
```

## File Structure

```
/pages/                          # Route page components
  ├── LandingPage.tsx            # Wrapper for landing page
  ├── SignInPage.tsx             # Sign-in route
  ├── SignUpPage.tsx             # Sign-up route
  ├── ResetPasswordPage.tsx      # Password reset route
  ├── DashboardLayout.tsx        # Layout wrapper for dashboard routes
  ├── CountrySelectionPage.tsx   # Country selection route
  ├── NumberSelectionPage.tsx    # Number selection route
  └── ActiveNumberPage.tsx       # Active number route

/components/                     # Reusable UI components
  ├── LandingPage.tsx            # Landing page component
  ├── SignIn.tsx                 # Sign-in form component
  ├── SignUp.tsx                 # Sign-up form component
  ├── ResetPassword.tsx          # Reset password component
  ├── CountrySelection.tsx       # Country selection component
  ├── NumberSelection.tsx        # Number selection component
  ├── ActiveNumber.tsx           # Active number component
  └── Navigation.tsx             # Top navigation bar
```

## State Management

### Route State
Data is passed between routes using React Router's `state` prop:

```typescript
// Navigate with state
navigate('/dashboard/numbers/us', { state: { country } });

// Access state in target component
const location = useLocation();
const country = location.state?.country;
```

### Authentication State
Currently managed in `App.tsx` using React state. In production, consider:
- Context API for global auth state
- LocalStorage/SessionStorage for persistence
- Auth tokens for API calls

## Navigation Examples

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to route
navigate('/dashboard');

// Navigate with state
navigate('/dashboard/numbers/us', { state: { country } });

// Navigate back
navigate(-1);
```

### Link Navigation
```typescript
import { Link } from 'react-router-dom';

<Link to="/signin">Sign In</Link>
<Link to="/dashboard">Dashboard</Link>
```

## Back Button Logic

The `DashboardLayout` component handles smart back button navigation:

```
/dashboard/active/:numberId → /dashboard/numbers/:countryId
/dashboard/numbers/:countryId → /dashboard
/dashboard → /
```

## Future Enhancements

Consider adding:
- [ ] Route-based code splitting with `React.lazy()`
- [ ] Loading states for route transitions
- [ ] Breadcrumb navigation
- [ ] Route-level error boundaries
- [ ] 404 Not Found page
- [ ] Persistent authentication (localStorage/cookies)
- [ ] Route guards with role-based access
- [ ] Query parameters for filtering/sorting
- [ ] URL state synchronization

## Development Notes

- All page components are in `/pages` directory
- All reusable UI components are in `/components` directory
- Route protection logic is in `App.tsx`
- Navigation component adapts based on current route
- State is passed via React Router's location state
