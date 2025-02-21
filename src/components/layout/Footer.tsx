import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">About Us</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Blog</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Careers</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">FAQs</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Facebook</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Instagram</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © 2025 Food4Code. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;