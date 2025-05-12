# Supabase User Roles Integration Guide

## 1. Supabase Table Setup

### Create Tables in Supabase Dashboard:

```sql
-- Profiles Table
create table profiles (
  user_id uuid references auth.users not null primary key,
  display_name text,
  avatar_url text,
  role text check (role in ('admin', 'school', 'frontdesk'))
);

-- School Specific Table (example)
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_email text
);
```

## 2. Client-Side Implementation

### Initialize Supabase Client (dashboard.js):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
```

### Fetch User Data:

```javascript
async function loadUserData() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('user_id', user.id)
    .single();

  if (!error) {
    document.getElementById('user-name').textContent = profile.display_name;
    document.getElementById('user-role').textContent = profile.role;
  }
}
```

## 3. Dashboard Implementation

### admin-dashboard.html:

```html
<div class="user-panel">
  <h2>Welcome, <span id="user-name"></span></h2>
  <p>Role: <span id="user-role"></span></p>
</div>
```

## 4. Security Rules

Add Row Level Security policies in Supabase:

```sql
-- Profiles table policy
create policy "Users can view their own profile"
on profiles for select using (auth.uid() = user_id);

create policy "Users can update their profile"
on profiles for update using (auth.uid() = user_id);
```

## 5. Existing Implementation Patterns

Patterns found in your dashboard files:

**admin-dashboard.html**
- Uses `data-role` attributes for UI differentiation
- User greeting element: `#user-greeting`

**dashboard.js**
- Auth state listener pattern:
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') loadUserData();
});
```

**assistant.js**
- Error handling pattern:
```javascript
.catch(error => {
  console.error('Supabase error:', error);
  showToastMessage('Error loading user data');
});

```

## File Locations

Key functions and their implementations:

| Function/Purpose | File Location | Function Implementation |
|-------------------|---------------|------------------------|
| User data loading | `frontend/js/dashboard.js` | `loadUserData()` |
| Auth state management | `frontend/js/auth.js` |  |
| Role-based redirects | `frontend/js/school.js` |  |
| Display name rendering | `frontend/pages/admin-dashboard.html` |  |
| Role-specific UI elements | `frontend/pages/school-dashboard.html` |  |
| Error handling | `frontend/js/assistant.js` |  |
| Supabase client config | `frontend/js/config.js` |  |
