'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Puzzle, ArrowRight, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Puzzle {
  id: string
  title: string
  image_url: string
  piece_count: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number
  plays: number
}

export function RecommendationsSection() {
  const recommendations: Puzzle[] = [
    {
      id: '1',
      title: 'Ocean Waves',
      image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      piece_count: 150,
      difficulty: 'Medium',
      rating: 4.8,
      plays: 2847
    },
    {
      id: '2',
      title: 'Forest Path',
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      piece_count: 200,
      difficulty: 'Hard',
      rating: 4.6,
      plays: 1923
    },
    {
      id: '3',
      title: 'City Skyline',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      piece_count: 100,
      difficulty: 'Easy',
      rating: 4.9,
      plays: 4521
    }
  ]

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy'
      case 'Medium': return 'difficulty-medium'
      case 'Hard': return 'difficulty-hard'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <section className="py-20 section-alt dark:bg-[#0c0c12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-subtle dark:bg-primary/10 text-primary mb-4 border border-primary/20 dark:border-primary/20 shadow-sm">
              <Star className="w-4 h-4 mr-1" />
              Featured
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white mb-3 tracking-tight">
              Today&apos;s Recommendations
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-400 max-w-xl">
              Discover amazing puzzles handpicked just for you by our community
            </p>
          </div>
          <Link href="/explore/all">
            <Button variant="outline" className="group bg-card dark:bg-transparent dark:border-white/10 dark:text-white dark:hover:bg-white/5 dark:hover:border-white/20 transition-all">
              View All Puzzles
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Puzzles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((puzzle, index) => (
            <Card 
              key={puzzle.id} 
              className={cn(
                "group overflow-hidden card-hover border-0 shadow-lg",
                "dark:bg-[#15151a] dark:border dark:border-white/10 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-primary/5 dark:hover:border-primary/20 transition-all duration-300",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0 relative">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={puzzle.image_url}
                    alt={puzzle.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Difficulty badge */}
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm",
                      getDifficultyStyle(puzzle.difficulty)
                    )}>
                      {puzzle.difficulty}
                    </span>
                  </div>
                  
                  {/* Hover play button */}
                  <Link href={`/play/${puzzle.id}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button size="lg" className="bg-white text-foreground hover:bg-white/90 scale-90 group-hover:scale-100 transition-transform shadow-xl">
                        <span className="mr-2">▶</span>
                        Play Now
                      </Button>
                    </div>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <CardTitle className="text-xl font-semibold text-foreground dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-400 transition-colors tracking-tight">
                  {puzzle.title}
                </CardTitle>
                
                {/* Stats row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Puzzle className="w-4 h-4" />
                      {puzzle.piece_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      {puzzle.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground dark:text-gray-500">
                    {puzzle.plays.toLocaleString()} plays
                  </span>
                </div>
                
                {/* Action row */}
                <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/5">
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    ~{Math.round(puzzle.piece_count / 10)} min
                  </span>
                  <Link 
                    href={`/p/${puzzle.id}`}
                    className="text-sm font-medium text-primary dark:text-primary-400 hover:text-primary/80 dark:hover:text-primary-300 transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card dark:bg-card/50 border border-border dark:border-white/5 shadow-lg backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground">Want more puzzles?</p>
              <p className="text-sm text-muted-foreground">Browse our collection of 1000+ puzzles</p>
            </div>
            <Link href="/explore/all">
              <Button className="btn-shine whitespace-nowrap">
                Explore All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
