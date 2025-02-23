import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">About</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
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
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
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
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-colors"
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
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-gray-600">© {new Date().getFullYear()} Food4Code. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

