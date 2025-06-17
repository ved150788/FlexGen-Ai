# Feedback System Implementation

This document describes the global feedback system implementation for FlexGen.ai.

## Features Implemented

### 1. Always-Visible Feedback Button

- **Location**: Floating button on all tool pages (bottom-right corner)
- **Implementation**: `components/feedback/FeedbackButton.tsx` with multiple variants
- **Global Integration**: Added to `app/tools/layout.tsx` to appear on every tool page
- **Auto Module Detection**: Automatically detects the current tool name from URL

### 2. Role-Based Feedback Views

#### Admin Users

- **Dashboard**: `/feedback-dashboard` - View and manage ALL feedback submissions
- **Features**:
  - Filter by status, module, category, rating, date range
  - Search functionality
  - Edit/update feedback status
  - View detailed feedback with comments
  - Pagination for large datasets

#### Regular Users

- **My Feedback**: `/my-feedback` - View only their own submitted feedback
- **Features**:
  - Track status of submitted feedback
  - View developer responses
  - Search their own feedback
  - Filter by status
  - Expandable conversation threads

### 3. Automatic Role-Based Routing

- Admin users are automatically redirected to `/feedback-dashboard`
- Regular users are automatically redirected to `/my-feedback`
- Prevents unauthorized access to admin features

## File Structure

```
├── components/
│   ├── feedback/
│   │   ├── FeedbackButton.tsx      # Main feedback button component
│   │   └── FeedbackModal.tsx       # Feedback submission modal
│   └── navigation/
│       └── FeedbackNavigation.tsx  # Role-based navigation links
├── app/
│   ├── api/
│   │   └── feedback/
│   │       ├── route.ts            # Main feedback API proxy
│   │       └── dashboard/
│   │           └── route.ts        # Admin dashboard API proxy
│   ├── feedback-dashboard/
│   │   └── page.tsx               # Admin feedback dashboard
│   ├── my-feedback/
│   │   └── page.tsx               # User feedback page
│   └── tools/
│       └── layout.tsx             # Global tools layout with feedback button
└── lib/
    └── hooks/
        └── useAuth.ts             # Authentication hook
```

## Components Usage

### FeedbackButton Variants

```tsx
import {
  FeedbackButton,
  FloatingFeedbackButton,
  HeaderFeedbackButton,
  SidebarFeedbackButton
} from "@/components/feedback/FeedbackButton";

// Floating button (used globally)
<FloatingFeedbackButton currentModule="Tool Name" userId="user123" username="john" />

// Header button
<HeaderFeedbackButton currentModule="Dashboard" />

// Sidebar button
<SidebarFeedbackButton currentModule="Settings" />
```

### Navigation Links

```tsx
import {
	FeedbackNavigation,
	HeaderFeedbackNavigation,
	SidebarFeedbackNavigation,
} from "@/components/navigation/FeedbackNavigation";

// Automatically shows correct link based on user role
<SidebarFeedbackNavigation />;
```

### Authentication Hook

```tsx
import { useAuth } from "@/lib/hooks/useAuth";

function MyComponent() {
	const { user, isAdmin, isAuthenticated, loading } = useAuth();

	if (loading) return <div>Loading...</div>;

	if (isAdmin) {
		// Show admin features
	} else {
		// Show user features
	}
}
```

## API Endpoints

### POST /api/feedback

Submit new feedback (available to all authenticated users)

### GET /api/feedback

Get feedback with filtering options:

- For regular users: Only returns their own feedback
- Query params: `userId`, `search`, `status`, `module`, etc.

### GET /api/feedback/dashboard

Admin-only endpoint for viewing all feedback with advanced filtering

## Environment Variables

Add to your `.env.local`:

```bash
# Feedback System
NEXT_PUBLIC_FEEDBACK_API_URL="http://localhost:3001"
FEEDBACK_BACKEND_PORT=3001
FEEDBACK_DB_URL="your_feedback_database_url"
```

## Backend Integration

The frontend proxies requests to the existing feedback backend at:

- `app/feedback/backend/` - Node.js Express server
- `app/feedback/frontend/` - Existing React components (used as reference)

## Mock Authentication

For testing, the system includes mock authentication:

```tsx
import { setMockUser } from "@/lib/hooks/useAuth";

// Set admin user
setMockUser("admin");

// Set regular user
setMockUser("user");
```

## Module Name Detection

The system automatically detects tool names from URLs:

- `/tools/threat-intelligence` → "Threat Intelligence"
- `/tools/api-fuzzer` → "Api Fuzzer"
- `/tools/vulnerability-scanner` → "Vulnerability Scanner"

## Styling

The feedback components use Tailwind CSS and are designed to:

- Match the existing FlexGen.ai design system
- Be responsive across all device sizes
- Provide smooth animations and transitions
- Maintain high contrast and accessibility

## Security Features

- Role-based access control
- Input validation and sanitization
- File upload restrictions (5MB max, specific file types)
- Rate limiting (backend implementation)
- CSRF protection (backend implementation)

## Next Steps

1. **Replace Mock Auth**: Update `lib/hooks/useAuth.ts` with your actual authentication system
2. **Backend Integration**: Ensure the feedback backend is running on port 3001
3. **Database Setup**: Configure the feedback database connection
4. **Email Notifications**: Set up email notifications for new feedback
5. **File Storage**: Configure file upload storage (local/cloud)
6. **Monitoring**: Add analytics and monitoring for feedback metrics

## Testing

The system includes comprehensive role-based testing:

- Admin users can access dashboard and manage all feedback
- Regular users can only access their own feedback
- Automatic redirects work correctly
- Feedback submission works from all tool pages
- Modal validation and error handling work properly

## Customization

To customize the feedback system:

1. **Styling**: Modify Tailwind classes in components
2. **Fields**: Update `FeedbackModal.tsx` to add/remove form fields
3. **Modules**: Update `FLEXGEN_MODULES` array in `FeedbackModal.tsx`
4. **Routing**: Modify role-based redirects in page components
5. **API**: Extend API routes for additional functionality
