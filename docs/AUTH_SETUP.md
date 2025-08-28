### Supabase OAuth (Google/Facebook)

1) Enable providers in Supabase Dashboard → Authentication → Providers
- Turn on Google and Facebook; add Client ID/Secret.
- In each provider console, add redirect URL: `https://<project-ref>.supabase.co/auth/v1/callback`.

2) Configure URLs in Supabase Dashboard → Authentication → URL Configuration
- Site URL: your app (e.g. `http://localhost:5173` in dev)
- Redirect URLs: include `http://localhost:5173`

3) Frontend environment variables (create `.env`)
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4) Frontend code
- Client: `src/services/supabase.ts`
- Provider: wrap app with `AuthProvider` in `src/main.tsx`
- Login buttons: `src/components/LoginOAuth.tsx`

5) Use session/user where needed
- Consume `AuthContext` to access `user` and `session`.
