import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <span className="text-xl font-bold text-gray-900">Phone Store</span>
            <p className="text-sm text-gray-600 leading-relaxed mt-4">
              Shop your favorite products with flexible EMI plans. No cost EMI available.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Smartphones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  EMI Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  How EMI Works
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-600">
                Email: support@emistore.com
              </li>
              <li className="text-sm text-gray-600">
                Phone: 1800-123-4567
              </li>
              <li className="text-sm text-gray-600">
                Mon-Sat: 9 AM - 6 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Phone Store. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
