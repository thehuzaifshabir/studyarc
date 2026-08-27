import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Instagram, Youtube, Send, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white tracking-tight">EduSphere</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Prepare smarter. Practice harder. Crack it. Your ultimate destination for JEE and NEET preparation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Telegram</span>
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/study-material" className="hover:text-white transition-colors">Study Material</Link></li>
              <li><Link to="/mock-tests" className="hover:text-white transition-colors">Mock Tests</Link></li>
              <li><Link to="/apps" className="hover:text-white transition-colors">Learning Apps</Link></li>
              <li><Link to="/donate" className="hover:text-white transition-colors">Support Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Creator</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:support@edusphere.example.com" className="hover:text-white transition-colors">
                  support@edusphere.example.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EduSphere. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-4 md:mt-0 flex items-center">
            Built with ❤️ for students
          </p>
        </div>
      </div>
    </footer>
  );
}
