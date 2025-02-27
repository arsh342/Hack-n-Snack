import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">About</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span>FAQs</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-gray-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-gray-600">Stay updated with our newsletter</p>
              <form className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-gray-800 shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-green-200 pt-8">
          <p className="text-center text-gray-600">© {new Date().getFullYear()} SnackSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;