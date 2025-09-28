import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Send, 
  Clock,
  CheckCircle,
  ExternalLink,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactTypes = [
    { id: 'general', label: 'General Inquiry', description: 'Questions about Noted' },
    { id: 'support', label: 'Technical Support', description: 'Help with using the platform' },
    { id: 'partnership', label: 'Partnership', description: 'Business partnerships and collaborations' },
    { id: 'press', label: 'Press & Media', description: 'Media inquiries and press requests' },
    { id: 'feedback', label: 'Feedback', description: 'Product feedback and suggestions' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Replace with actual form submission to backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      contactType: 'general'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          Get in Touch
        </h1>
        <p className="text-[20px] leading-[28px] text-white/70 text-center max-w-3xl mx-auto">
          Have questions about Noted or Mentra Live glasses integration? 
          We'd love to hear from you. Our team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
          <h2 className="font-medium text-[24px] text-white mb-6">Send us a message</h2>
          
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Message Sent!</h3>
              <p className="text-white/70 mb-6">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Type Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  What can we help you with?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {contactTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.contactType === type.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contactType"
                        value={type.id}
                        checked={formData.contactType === type.id}
                        onChange={(e) => handleInputChange('contactType', e.target.value)}
                        className="text-blue-500"
                      />
                      <div>
                        <div className="font-medium text-white">{type.label}</div>
                        <div className="text-sm text-white/70">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject *
                </label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief subject line"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Message *
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
                className="w-full bg-white hover:bg-gray-100 text-[#1e3a8a]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#030213] mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="font-medium text-[20px] text-white mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-white/70">hello@noted.ai</div>
                  <div className="text-white/70">support@noted.ai</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Phone</div>
                  <div className="text-white/70">+1 (555) 123-4567</div>
                  <div className="text-xs text-white/50">Mon-Fri, 9 AM - 6 PM PST</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Office</div>
                  <div className="text-white/70">
                    123 Innovation Drive<br />
                    San Francisco, CA 94107<br />
                    United States
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Response Time</div>
                  <div className="text-white/70">Within 24 hours</div>
                  <div className="text-xs text-white/50">Priority support for partners</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Social Media & Resources */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="font-medium text-[20px] text-white mb-6">Connect With Us</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex-1"
                  onClick={() => window.open('https://twitter.com/noted_ai', '_blank')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex-1"
                  onClick={() => window.open('https://linkedin.com/company/noted-ai', '_blank')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </div>

              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 w-full"
                onClick={() => window.open('https://github.com/noted-ai', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                Open Source Projects
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          </Card>

          {/* FAQ Quick Links */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="font-medium text-[20px] text-white mb-4">Quick Help</h3>
            
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-white mb-1">Mentra Live Integration</div>
                <div className="text-white/70">
                  Setup guides and troubleshooting for glasses connectivity
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-white mb-1">AI Features</div>
                <div className="text-white/70">
                  Learn about timeline generation, knowledge hubs, and more
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-white mb-1">Privacy & Security</div>
                <div className="text-white/70">
                  Information about data handling and privacy protection
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 w-full mt-4"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Visit Help Center
            </Button>
          </Card>
        </div>
      </div>

      {/* Enterprise Contact */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 p-8">
        <div className="text-center">
          <h3 className="font-medium text-[24px] text-white mb-4">Enterprise Solutions</h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Looking to integrate Noted with your organization's Mentra Live glasses deployment? 
            Our enterprise team can help with custom implementations and bulk licensing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white hover:bg-gray-100 text-[#1e3a8a]">
              <Mail className="w-4 h-4 mr-2" />
              enterprise@noted.ai
            </Button>
            <Button 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}