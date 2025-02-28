"use client";

import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-10 lg:gap-12 mb-6 sm:mb-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">About</h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Support</h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base"
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>FAQs</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Legal</h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm sm:text-base">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Connect</h3>
            <div className="flex gap-2 sm:gap-4">
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
            <div className="mt-4 sm:mt-6">
              <p className="text-gray-600 text-xs sm:text-sm">Stay updated with our newsletter</p>
              <form className="mt-1 sm:mt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 sm:px-4 py-1 sm:py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-gray-800 shadow-sm text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md text-xs sm:text-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-green-200 pt-6 sm:pt-8">
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            © {new Date().getFullYear()} SnackSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;