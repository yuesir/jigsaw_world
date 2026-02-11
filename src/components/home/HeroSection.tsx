'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Clock, Sparkles, Puzzle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DailyPuzzle {
  id: string
  title: string
  image_url: string
  description: string
  piece_count: number
  created_at: string
}

export function HeroSection() {
  const [dailyPuzzle, setDailyPuzzle] = useState<DailyPuzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // TODO: Fetch daily puzzle from Supabase
    const mockDailyPuzzle: DailyPuzzle = {
      id: '1',
      title: 'Mountain Landscape',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'A beautiful mountain landscape puzzle to challenge your mind and provide hours of entertainment',
      piece_count: 100,
      created_at: new Date().toISOString()
    }
    
    setTimeout(() => {
      setDailyPuzzle(mockDailyPuzzle)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-muted rounded-full w-32" />
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
              <div className="h-12 bg-muted rounded w-40" />
            </div>
            <div className="animate-pulse">
              <div className="bg-muted rounded-2xl aspect-[4/3] w-full" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!dailyPuzzle) {
    return null
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Daily Challenge</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {dailyPuzzle.title}
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {dailyPuzzle.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-card border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Puzzle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                  <p className="font-semibold text-foreground">{dailyPuzzle.piece_count} pieces</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-card border">
                <div className="p-2 rounded-lg bg-success/10">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Time</p>
                  <p className="font-semibold text-foreground">15-25 min</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href={`/play/${dailyPuzzle.id}`}>
                <Button size="lg" className="btn-shine text-base px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>
              </Link>
              <Link href={`/p/${dailyPuzzle.id}`}>
                <Button size="lg" variant="outline" className="text-base px-8 group">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
              
              <Card className="relative overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={dailyPuzzle.image_url}
                      alt={dailyPuzzle.title}
                      fill
                      className={cn(
                        "object-cover transition-all duration-700",
                        imageLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
                      )}
                      priority
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Hover play button */}
                    <Link href={`/play/${dailyPuzzle.id}`}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-sm">
                        <Button size="lg" className="bg-white text-foreground hover:bg-white/90 scale-90 hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 mr-2 fill-current" />
                          Start Puzzle
                        </Button>
                      </div>
                    </Link>
                    
                    {/* Corner badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-foreground backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Daily
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -right-6 bg-card border rounded-2xl p-4 shadow-xl hidden lg:block animate-float">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">1,247 players</p>
                    <p className="text-xs text-muted-foreground">completed today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
