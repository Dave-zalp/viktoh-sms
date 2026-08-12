import { useEffect } from 'react';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    '@type': string;
    telephone: string;
    contactType: string;
    availableLanguage: string;
  };
  sameAs?: string[];
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export function StructuredData() {
  useEffect(() => {
    // Organization Schema
    const organizationSchema: OrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Viktohs SMS',
      url: 'https://viktohssms.com',
      logo: 'https://viktohssms.com/logo.png',
      description: 'Instant virtual phone numbers for SMS verification services',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+234-813-321-8597',
        contactType: 'Customer Service',
        availableLanguage: 'English'
      },
      sameAs: [
        'https://t.me/viktohs_store_customer_care'
      ]
    };

    // Website Schema
    const websiteSchema: WebsiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Viktohs SMS',
      url: 'https://viktohssms.com',
      description: 'Get instant virtual phone numbers for SMS verification. Secure, affordable, and reliable verification codes for social media and online services.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://viktohssms.com/dashboard/all-countries?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };

    // Add or update organization schema
    let orgScript = document.querySelector('script[data-schema="organization"]');
    if (!orgScript) {
      orgScript = document.createElement('script');
      orgScript.setAttribute('type', 'application/ld+json');
      orgScript.setAttribute('data-schema', 'organization');
      document.head.appendChild(orgScript);
    }
    orgScript.textContent = JSON.stringify(organizationSchema);

    // Add or update website schema
    let websiteScript = document.querySelector('script[data-schema="website"]');
    if (!websiteScript) {
      websiteScript = document.createElement('script');
      websiteScript.setAttribute('type', 'application/ld+json');
      websiteScript.setAttribute('data-schema', 'website');
      document.head.appendChild(websiteScript);
    }
    websiteScript.textContent = JSON.stringify(websiteSchema);
  }, []);

  return null;
}