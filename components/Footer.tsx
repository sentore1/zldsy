'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface ExternalLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  icon?: string;
  open_in_new_tab: boolean;
}

export default function Footer() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/external-links?show_in_footer=true&is_active=true');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching footer links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group links by category
  const linksByCategory = links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, ExternalLink[]>);

  const categoryLabels: Record<string, string> = {
    tips: 'Tips & Guides',
    blog: 'Blog',
    resources: 'Resources',
    help: 'Help & Support',
    social: 'Follow Us',
    other: 'Links',
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Service Management</h3>
            <p className="text-gray-400 text-sm">
              Professional service management solutions for your business.
            </p>
          </div>

          {/* External Links - Grouped by Category */}
          {!loading && Object.keys(linksByCategory).length > 0 && (
            <>
              {Object.entries(linksByCategory).map(([category, categoryLinks]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold mb-4">
                    {categoryLabels[category] || category}
                  </h3>
                  <ul className="space-y-2">
                    {categoryLinks.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target={link.open_in_new_tab ? '_blank' : '_self'}
                          rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
                          className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition"
                        >
                          {link.title}
                          {link.open_in_new_tab && (
                            <ExternalLinkIcon className="w-3 h-3" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/customer" className="text-gray-400 hover:text-white text-sm transition">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Service Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
