# Ali Electronic — Store + Admin Panel (React + Supabase)

Products, categories, offers/sales, orders, homepage settings and images are all stored in **Supabase**,
so whatever the owner changes in the admin panel shows on every device (mobile, laptop, customers).

## 1. Supabase setup (one time)

1. Supabase Dashboard → **SQL Editor** → paste all of `supabase/schema.sql` → **Run**.
   (Safe to run again later; it will not overwrite existing products or settings.)
2. Optional, only on a brand-new project and only once: run `supabase/seed-demo-data.sql` for sample products.
3. **Authentication → Users → Add user** → enter the owner's email + password (tick *Auto Confirm User*).
   This email/password is the admin login of the website.
4. **Authentication → Sign In / Providers → turn OFF "Allow new users to sign up"**, so nobody else can create an admin account.
5. **Project Settings → API** → copy the *Project URL* and the *anon public* key.

## 2. Environment variables

Locally create `.env.local`, and on Vercel add the same under **Project → Settings → Environment Variables**
(then **Redeploy**, because Vite reads them at build time):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run / deploy

```
npm install
npm run dev        # local
npm run build      # production build (Vercel runs this automatically)
```

Push to GitHub, import the repo in Vercel, add the two variables, deploy.

## 4. Using the admin panel

Open the site → admin icon → sign in with the Supabase email + password.
Add/edit products, upload images, set Old Price / Discount or use the bulk **Sale** button, manage offers, categories,
orders and homepage content. Everything is saved to Supabase immediately.

If something cannot be saved, the panel now shows the real reason instead of silently saving on one device only.
