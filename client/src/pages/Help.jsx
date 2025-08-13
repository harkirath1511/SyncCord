import React, { useState } from 'react';
import { isAlphabetsOnly } from '../helper/stringCheck';
import {motion} from 'framer-motion'
import { Link } from 'react-router-dom';

function Help() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isAlphabetsOnly(formData.name, true)) {
      newErrors.name = 'Name should contain only letters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      setSubmitted(true);
      
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center relative mb-12">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Link 
              to="/home" 
              className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="sr-only">Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">How Can We Help You?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get support, send feedback, or contact our team directly. We're here to help you make the most of our platform.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-4 text-sm font-medium flex-1 sm:flex-none ${
                activeTab === 'contact' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contact Us
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-4 text-sm font-medium flex-1 sm:flex-none ${
                activeTab === 'faq' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQ
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-4 text-sm font-medium flex-1 sm:flex-none ${
                activeTab === 'resources' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resources
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                      <p className="mt-2 text-gray-600">
                        Have questions? We're here to help you.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                          <p className="mt-1 text-sm text-gray-600">+91 585858585</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email</h3>
                          <p className="mt-1 text-sm text-gray-600">support@chatapp.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Address</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            123 Tech Park, Sector 7<br />
                            Bangalore, India 560001
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Follow Us</h3>
                      <div className="mt-2 flex space-x-4">
                        <a href="https://x.com/_harkirath_" className="text-gray-400 hover:text-blue-500">
                          <span className="sr-only">Twitter</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                        <a href="https://github.com/harkirath1511" className="text-gray-400 hover:text-blue-500">
                          <span className="sr-only">GitHub</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a href="https://www.linkedin.com/in/harkirat-singh-04b9ba320" className="text-gray-400 hover:text-blue-500">
                          <span className="sr-only">LinkedIn</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitted && (
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-md bg-green-50 p-4 mb-6 border border-green-100"
                        >
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Message sent successfully!</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-1">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`pl-10 block w-full rounded-lg border ${errors.name ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                              placeholder="John Doe"
                            />
                          </div>
                          {errors.name && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                              {errors.name}
                            </motion.p>
                          )}
                        </div>
                        
                        <div className="col-span-1">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`pl-10 block w-full rounded-lg border ${errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                              placeholder="john@example.com"
                            />
                          </div>
                          {errors.email && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-sm text-red-600 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {errors.email}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`pl-10 block w-full rounded-lg border ${errors.subject ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                            placeholder="How can we help you?"
                          />
                        </div>
                        {errors.subject && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-1 text-sm text-red-600 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.subject}
                          </motion.p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <div className="relative">
                          <textarea
                            name="message"
                            id="message"
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            className={`block w-full rounded-lg border ${errors.message ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                            placeholder="Tell us how we can assist you..."
                          ></textarea>
                        </div>
                        {errors.message && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-1 text-sm text-red-600 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.message}
                          </motion.p>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          <div className="flex items-center justify-center">
                            <span>Send Message</span>
                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </motion.button>
                      </div>
                      
                      <div className="text-center text-xs text-gray-500 pt-4">
                        We value your privacy. All information submitted will be handled according to our 
                        <a href="#" className="text-blue-500 hover:text-blue-700"> Privacy Policy</a>.
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">How do I create a new account?</h3>
                    <p className="mt-2 text-gray-600">
                      To create a new account, click on the "Sign Up" button in the top-right corner of the page. 
                      Fill in the required information including your name, email address, and password. 
                      Then verify your email and you're ready to go!
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">How do I create or join a group chat?</h3>
                    <p className="mt-2 text-gray-600">
                      To create a group chat, click on the "+" icon in the sidebar and select "New Group". 
                      Add participants from your contacts list and give your group a name. To join an existing group, 
                      you need to be invited by a current member of that group.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">Is my conversation data secure?</h3>
                    <p className="mt-2 text-gray-600">
                      Yes, all conversations are encrypted and stored securely. We use industry-standard encryption 
                      protocols to ensure that your messages can only be read by the intended recipients. 
                      Your privacy is our top priority.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">How do I reset my password?</h3>
                    <p className="mt-2 text-gray-600">
                      To reset your password, click on the "Forgot Password" link on the login page. 
                      Enter the email address associated with your account, and we'll send you instructions 
                      on how to create a new password.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">Can I delete messages after sending them?</h3>
                    <p className="mt-2 text-gray-600">
                      Yes, you can delete messages after sending them. Hover over the message you want to delete, 
                      click on the three dots that appear, and select "Delete". You can choose to delete the message 
                      just for yourself or for everyone in the conversation.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'resources' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Helpful Resources</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-medium text-gray-900">User Guide</h3>
                      <p className="mt-2 text-gray-600">
                        Comprehensive documentation to help you get the most out of our platform.
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Read the guide
                        <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-medium text-gray-900">Video Tutorials</h3>
                      <p className="mt-2 text-gray-600">
                        Step-by-step videos showing how to use all features of our platform.
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Watch tutorials
                        <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-medium text-gray-900">API Documentation</h3>
                      <p className="mt-2 text-gray-600">
                        Technical documentation for developers integrating with our platform.
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View API docs
                        <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-medium text-gray-900">Community Forum</h3>
                      <p className="mt-2 text-gray-600">
                        Connect with other users, share tips, and get help from the community.
                      </p>
                      <a
                        href="#"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Join the forum
                        <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 bg-blue-50 rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
