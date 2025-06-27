# Setting Up a Custom Domain for Wildlife Immobilization App

This guide will help you set up a custom domain for your Wildlife Immobilization application deployed on Netlify.

## Prerequisites

1. A domain name purchased from a domain registrar (like GoDaddy, Namecheap, Google Domains, etc.)
2. Access to your domain's DNS settings
3. Your Netlify site already deployed (which you've completed)

## Step 1: Add Your Custom Domain in Netlify

1. Log in to your Netlify account
2. Go to your site's dashboard (click on the site name)
3. Navigate to **Site settings** → **Domain management** → **Custom domains**
4. Click **Add custom domain**
5. Enter your domain name (e.g., `wildlife-immobilization.com`) and click **Verify**
6. If you own the domain, click **Add domain**

## Step 2: Configure DNS

### Option A: Using Netlify DNS (Recommended)

1. In your domain's card in the Custom domains panel, click **Set up Netlify DNS**
2. Follow the step-by-step instructions provided by Netlify
3. You'll need to update your domain's nameservers at your registrar to point to Netlify's nameservers

### Option B: Using External DNS

1. Go to your domain registrar's website
2. Access the DNS settings for your domain
3. Add the following DNS records:

   | Record Type | Name | Value | TTL |
   |-------------|------|-------|-----|
   | A | @ | 75.2.60.5 | Auto |
   | CNAME | www | [your-site-name].netlify.app | Auto |

4. Wait for DNS propagation (up to 48 hours, though often much faster)

## Step 3: Configure SSL/HTTPS

1. In your site's Netlify dashboard, go to **Site settings** → **Domain management** → **HTTPS**
2. Ensure that **Netlify managed certificate** is enabled
3. Netlify will automatically provision an SSL certificate for your custom domain

## Step 4: Update Internal Site References

Update any hardcoded URLs in your application to use your custom domain:

1. Open `c:\Users\Admin\CascadeProjects\Immo\src\app\layout.tsx`
2. Update the `metadataBase` URL to your custom domain:

```typescript
export const metadata: Metadata = {
  title: 'Wildlife Immobilization Tracker',
  description: 'Track and manage wildlife immobilization events',
  metadataBase: new URL('https://your-custom-domain.com'),
  // ...
};
```

## Step 5: Deploy the Changes

1. Commit and push the changes to your GitHub repository
2. Netlify will automatically rebuild and deploy your site with the updated configuration

## Step 6: Verify Setup

1. Visit your custom domain (e.g., `https://wildlife-immobilization.com`)
2. Check that HTTPS is working properly (look for the lock icon in your browser's address bar)
3. Test all functionality to ensure everything works correctly with the custom domain

## Troubleshooting

- **DNS propagation issues**: DNS changes can take up to 48 hours to propagate. Use [dnschecker.org](https://dnschecker.org) to check if your DNS settings have propagated.
- **Certificate issues**: If HTTPS isn't working, go to the HTTPS section in Netlify and verify the certificate status.
- **Domain verification**: If you're having trouble verifying domain ownership, try adding a TXT record as directed by Netlify.

## Recommended Custom Domain Settings

- Enable HTTPS redirection (automatically redirect HTTP to HTTPS)
- Set up a redirect from `www` to apex domain or vice versa (depending on your preference)
- Consider enabling domain privacy with your registrar
