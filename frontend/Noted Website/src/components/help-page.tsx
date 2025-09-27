import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageSquare,
  Settings,
  Glasses,
  Brain,
  Shield,
  Zap,
  ExternalLink,
  ChevronRight,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(null);

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Basic setup and first steps with Noted",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      articleCount: 6,
    },
    {
      id: "mentra-live",
      title: "Mentra Live Integration",
      description: "Connect and use your Mentra Live glasses",
      icon: Glasses,
      color: "from-blue-500 to-cyan-500",
      articleCount: 8,
    },
    {
      id: "timeline-features",
      title: "Searchable Timeline",
      description:
        "Navigate through audio and visual recordings with search",
      icon: Search,
      color: "from-purple-500 to-pink-500",
      articleCount: 10,
    },
    {
      id: "highlights",
      title: "Mark This Highlights",
      description: "Voice or tap bookmarking of key moments",
      icon: Star,
      color: "from-orange-500 to-red-500",
      articleCount: 7,
    },
    {
      id: "summaries",
      title: "Auto-Summary & Digest",
      description: "AI-generated summaries and review cards",
      icon: Brain,
      color: "from-indigo-500 to-purple-500",
      articleCount: 9,
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: Settings,
      color: "from-yellow-500 to-orange-500",
      articleCount: 8,
    },
  ];

  const faqItems = [
    {
      category: "getting-started",
      question:
        "How do I connect my Mentra Live glasses to Noted?",
      answer:
        'To connect your Mentra Live glasses: 1) Make sure your glasses are charged and powered on, 2) Open the Noted app and go to Settings > Device Connection, 3) Select "Mentra Live Glasses" and follow the pairing instructions, 4) Once connected, you\'ll see a green indicator in the top-right corner.',
    },
    {
      category: "timeline-features",
      question:
        "How do I search for specific moments in my recordings?",
      answer:
        "Use the search bar in the Searchable Timeline to find keywords, concepts, or phrases. The AI automatically creates searchable transcripts and visual tags from your recordings. You can jump directly to any moment where your search term was mentioned or visually present.",
    },
    {
      category: "mentra-live",
      question: "What if my Mentra Live glasses won't connect?",
      answer:
        "Common solutions: 1) Ensure your glasses are within 10 feet of your device, 2) Check that Bluetooth is enabled, 3) Restart both your glasses and the Noted app, 4) Clear the Bluetooth cache in your device settings, 5) Make sure your glasses firmware is up to date.",
    },
    {
      category: "highlights",
      question:
        'How do I use "Mark This" to highlight important moments?',
      answer:
        'Simply say "Mark This" during recording or tap the highlight button on your connected device. The AI will automatically capture the context around that moment, including what was being said and any visual content (whiteboards, slides, etc.) for easy review later.',
    },
    {
      category: "timeline-features",
      question:
        "Can I see visual context alongside the audio timeline?",
      answer:
        "Yes! The Searchable Timeline shows thumbnail images captured at key moments, so you can see what was on the board, screen, or in view when important points were discussed. Click any thumbnail to see the full context with synchronized audio.",
    },
    {
      category: "summaries",
      question: "How accurate are the AI-generated summaries?",
      answer:
        "Our AI summaries typically achieve 90-95% accuracy in identifying key topics, decisions, and action items. The system analyzes both audio and visual content to create comprehensive summaries. You can always edit or add to the generated summaries.",
    },
    {
      category: "highlights",
      question:
        "Can I review all my highlighted moments in one place?",
      answer:
        'Absolutely! The Highlights section shows all your "Mark This" moments with their full context. You can filter by date, topic, or session to quickly find specific highlighted content and review key decisions or insights.',
    },
    {
      category: "mentra-live",
      question:
        "How long does the Mentra Live glasses battery last during recording?",
      answer:
        "Mentra Live glasses typically provide 6-8 hours of continuous recording time. Noted optimizes power usage by only processing audio when speech is detected. You can monitor battery levels through the Noted app and receive low battery notifications.",
    },
    {
      category: "summaries",
      question: "What types of summaries does Noted generate?",
      answer:
        "Noted creates several types of summaries: key topic overviews, action item lists, decision summaries, and keyword-highlighted review cards. Each summary type is optimized for different use cases like studying, meeting follow-ups, or research.",
    },
    {
      category: "troubleshooting",
      question: "Why is my timeline generation taking so long?",
      answer:
        "Timeline generation time depends on recording length and complexity. Typical processing times: 5-minute recording = 30 seconds, 30-minute recording = 2-3 minutes, 1-hour recording = 5-7 minutes. Longer delays may indicate network issues or high server load. Check your internet connection and try again.",
    },
  ];

  const quickGuides = [
    {
      title: "Setting Up Your First Recording",
      description:
        "5-minute guide to start recording with Mentra Live glasses",
      duration: "5 min",
      difficulty: "Beginner",
      icon: Video,
    },
    {
      title: "Using Searchable Timeline",
      description:
        "Learn how to navigate and search through your recordings",
      duration: "8 min",
      difficulty: "Beginner",
      icon: Search,
    },
    {
      title: "Mastering Mark This Highlights",
      description:
        "Advanced tips for bookmarking and reviewing key moments",
      duration: "6 min",
      difficulty: "Beginner",
      icon: Star,
    },
    {
      title: "Understanding AI Summaries",
      description:
        "Get the most out of auto-generated summaries and review cards",
      duration: "10 min",
      difficulty: "Intermediate",
      icon: Brain,
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      (!selectedCategory ||
        item.category === selectedCategory) &&
      (item.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        item.answer
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          Help Center
        </h1>
        <p className="text-[20px] leading-[28px] text-white/70 text-center max-w-3xl mx-auto">
          Find answers, learn features, and get the most out of
          your Noted and Mentra Live glasses experience.
        </p>
      </div>

      {/* Problems & Solutions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Problems */}
        <Card className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-medium text-white">
              Problems We Address
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-red-300 mb-3">
                Information Overload & Memory Loss
              </h3>
              <p className="text-white/80 leading-relaxed">
                People often miss or forget key details from
                lectures, meetings, or conversations because
                they can't fully listen, process, and take notes
                at the same time.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-red-300 mb-3">
                Lost Context Between Speech & Visuals
              </h3>
              <p className="text-white/80 leading-relaxed">
                Traditional notes or recordings capture only
                part of the story. They fail to connect spoken
                explanations with visual elements like slides,
                whiteboards, or diagrams, making it harder to
                recall and understand information later.
              </p>
            </div>
          </div>
        </Card>

        {/* Solutions */}
        <Card className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-medium text-white">
              Our Solutions
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-3">
                Handling Distraction & Missed Details
              </h3>
              <p className="text-white/80 leading-relaxed">
                Noted continuously captures and organizes audio
                and visuals, allowing users to "rewind" and
                review any moment they missed without
                interrupting the flow of the session.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-300 mb-3">
                Preserving Context
              </h3>
              <p className="text-white/80 leading-relaxed">
                By capturing speech and visuals together, Noted
                keeps explanations and references linked. Users
                can revisit information exactly as it was
                presented, rather than piecing it together from
                incomplete or disconnected notes.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for help articles, guides, or common questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 text-lg bg-white/10 border-white/20 text-white placeholder-white/50"
          />
        </div>
      </Card>

      {/* Quick Guides */}
      <div className="space-y-6">
        <h2 className="font-medium text-[32px] text-white">
          Quick Start Guides
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickGuides.map((guide, index) => {
            const IconComponent = guide.icon;
            return (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white text-lg">
                        {guide.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-white/70 text-sm mb-3">
                      {guide.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-white/60">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{guide.duration}</span>
                      </div>
                      <Badge
                        className={`text-xs ${
                          guide.difficulty === "Beginner"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {guide.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-[32px] text-white">
            Browse by Category
          </h2>
          {selectedCategory && (
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  selectedCategory === category.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id
                      ? null
                      : category.id,
                  )
                }
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-white text-lg mb-2">
                      {category.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-3">
                      {category.description}
                    </p>
                    <Badge className="bg-white/10 text-white text-xs">
                      {category.articleCount} articles
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="font-medium text-[32px] text-white">
          Frequently Asked Questions
          {selectedCategory && (
            <span className="text-white/70 text-lg ml-2">
              -{" "}
              {
                helpCategories.find(
                  (c) => c.id === selectedCategory,
                )?.title
              }
            </span>
          )}
        </h2>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <Accordion type="single" collapsible className="p-6">
            {filteredFAQ.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10"
              >
                <AccordionTrigger className="text-white hover:text-white/80 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {filteredFAQ.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
            <p className="text-white/70">
              No FAQ items found matching your search criteria.
            </p>
          </Card>
        )}
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 p-8">
        <div className="text-center">
          <h3 className="font-medium text-[24px] text-white mb-4">
            Still Need Help?
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team
            is here to help with any questions about Noted or
            Mentra Live glasses integration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white hover:bg-gray-100 text-[#1e3a8a]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Video className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() =>
                window.open(
                  "https://community.noted.ai",
                  "_blank",
                )
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Community Forum
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Feature Request */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white text-lg mb-2">
              Have a Feature Request?
            </h3>
            <p className="text-white/70 text-sm">
              We're always improving Noted. Share your
              ideas and vote on upcoming features.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Star className="w-4 h-4 mr-2" />
            Submit Idea
          </Button>
        </div>
      </Card>
    </div>
  );
}