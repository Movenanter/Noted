import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Users, Clock } from 'lucide-react';
const imgImage1 = "https://images.unsplash.com/photo-1758573466942-fbc45731e6eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaWNzJTIwbGFib3JhdG9yeSUyMHNjaWVuY2V8ZW58MXx8fHwxNzU5MDAwNjIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgImage2 = "https://images.unsplash.com/photo-1618250607237-17f7f854a243?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwbWljcm9zY29wZSUyMHN0dWR5fGVufDF8fHx8MTc1OTAwMDYyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgImage3 = "https://images.unsplash.com/photo-1613324767976-f65bc7d80936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYm9va3MlMjBsaWJyYXJ5fGVufDF8fHx8MTc1OTAwMDYyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface StudySet {
  id: number;
  title: string;
  author: string;
  image: string;
  cardCount: number;
  studyTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

const studySets: StudySet[] = [
  {
    id: 1,
    title: "Physics Lecture Notes",
    author: "Generated from Mentra Live Glasses",
    image: imgImage1,
    cardCount: 45,
    studyTime: "25 min",
    difficulty: "Medium",
    category: "Physics"
  },
  {
    id: 2,
    title: "Biology Field Study",
    author: "Generated from Mentra Live Glasses",
    image: imgImage2,
    cardCount: 62,
    studyTime: "40 min",
    difficulty: "Hard",
    category: "Biology"
  },
  {
    id: 3,
    title: "History Research Notes",
    author: "Generated from Mentra Live Glasses",
    image: imgImage3,
    cardCount: 38,
    studyTime: "20 min",
    difficulty: "Easy",
    category: "History"
  }
];

export function StudySets() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Generated Study Sets</h2>
        <p className="text-[#828282]">Choose a study set generated from your Mentra Live glasses notes to create a personalized quiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studySets.map((set) => (
          <Card key={set.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 bg-[#1a1a2e]">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={set.image}
                alt={set.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <Badge className={getDifficultyColor(set.difficulty)}>
                  {set.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                  {set.category}
                </Badge>
              </div>
              
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-white/80 transition-colors">
                {set.title}
              </h3>
              
              <p className="text-[#828282] mb-4">{set.author}</p>
              
              <div className="flex items-center gap-4 text-sm text-[#828282] mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{set.cardCount} cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{set.studyTime}</span>
                </div>
              </div>
              
              <Button className="w-full bg-white hover:bg-gray-100 text-[#1e3a8a] transition-colors">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}