import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Instagram, Youtube, Send, Mail, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white tracking-tight">Study Arc</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Prepare smarter. Practice harder. Crack it. Your ultimate destination for JEE and NEET preparation.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/bhatfarhaann/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/channel/AbZMB5wVrLhpZK2I/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram Broadcast Channel</span>
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@bhatfarhaann" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://t.me/studyarcinq" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Telegram</span>
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/notes/select" className="hover:text-white transition-colors">Notes</Link></li>
              <li><Link to="/mock-tests/select" className="hover:text-white transition-colors">Mock Tests</Link></li>
              <li><Link to="/study-apps" className="hover:text-white transition-colors">Learning Apps</Link></li>
              <li><Link to="/donate" className="hover:text-white transition-colors">Support Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:studyarcinq@gmail.com" className="hover:text-white transition-colors">
                  studyarcinq@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Study Arc. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-4 md:mt-0 flex items-center">
            Built with ❤️ for students
          </p>
        </div>
      </div>
    </footer>
  );
}
