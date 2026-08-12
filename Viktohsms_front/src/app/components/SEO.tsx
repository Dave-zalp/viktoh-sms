import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'Viktohs SMS - Instant Virtual Phone Numbers for SMS Verification',
  description = 'Get instant virtual phone numbers for SMS verification. Secure, affordable, and reliable verification codes for social media and online services.',
  keywords = 'virtual phone numbers, SMS verification, temporary phone numbers, SMS verification codes, online verification, social media verification, disposable phone numbers, SMS receive',
  ogImage = 'https://viktohssms.com/og-image.png',
  canonical,
  noindex = false
}: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set or update meta description
    updateMetaTag('name', 'description', description);

    // Set or update keywords
    updateMetaTag('name', 'keywords', keywords);

    // Set robots meta tag
    updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:url', canonical || window.location.href);
    updateMetaTag('property', 'og:site_name', 'Viktohs SMS');

    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // Canonical URL
    updateCanonicalLink(canonical || window.location.href);
  }, [title, description, keywords, ogImage, canonical, noindex]);

  return null;
}

function updateMetaTag(attribute: 'name' | 'property', attributeValue: string, content: string) {
  let metaTag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, attributeValue);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', href);
}