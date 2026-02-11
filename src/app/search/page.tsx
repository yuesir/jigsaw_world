'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Puzzle, Frown, Sparkles, Clock, Star, Filter, X, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Puzzle {
  id: string
  title: string
  image_url: string
  description: string
  piece_count: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number
  plays: number
  category: string
}

const popularSearches = ['mountain', 'ocean', 'forest', 'city', 'sunset', 'animals', 'flowers', 'space']
const recentSearches = ['beach sunset', 'winter mountain', 'city night']

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchResults, setSearchResults] = useState<Puzzle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(query)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const mockResults: Puzzle[] = [
      {
        id: '1',
        title: 'Mountain Landscape',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        description: 'A breathtaking mountain landscape with snow-capped peaks and rolling hills',
        piece_count: 100,
        difficulty: 'Easy',
        rating: 4.8,
        plays: 3421,
        category: 'Nature'
      },
      {
        id: '2',
        title: 'Ocean Waves',
        image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
        description: 'Stunning ocean waves crashing against the shore at golden hour',
        piece_count: 150,
        difficulty: 'Medium',
        rating: 4.6,
        plays: 2847,
        category: 'Ocean'
      },
      {
        id: '3',
        title: 'City Skyline at Night',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        description: 'Beautiful city skyline illuminated against the night sky',
        piece_count: 200,
        difficulty: 'Hard',
        rating: 4.9,
        plays: 4521,
        category: 'City'
      },
      {
        id: '4',
        title: 'Autumn Forest Path',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        description: 'A serene forest path surrounded by vibrant autumn colors',
        piece_count: 120,
        difficulty: 'Medium',
        rating: 4.7,
        plays: 1923,
        category: 'Forest'
      },
      {
        id: '5',
        title: 'Desert Dunes',
        image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop',
        description: 'Golden sand dunes stretching into the horizon',
        piece_count: 80,
        difficulty: 'Easy',
        rating: 4.5,
        plays: 1234,
        category: 'Nature'
      },
      {
        id: '6',
        title: 'Northern Lights',
        image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop',
        description: 'Spectacular aurora borealis dancing across the night sky',
        piece_count: 250,
        difficulty: 'Hard',
        rating: 4.9,
        plays: 5678,
        category: 'Nature'
      }
    ]

    setTimeout(() => {
      if (query) {
        const filtered = mockResults.filter(p => 
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(filtered)
      } else {
        setSearchResults([])
      }
      setLoading(false)
    }, 600)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    window.location.href = '/search'
  }

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy'
      case 'Medium': return 'difficulty-medium'
      case 'Hard': return 'difficulty-hard'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <section className="relative bg-muted/30 border-b border-border overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {query ? (
                <>
                  Search Results for{' '}
                  <span className="gradient-text">&quot;{query}&quot;</span>
                </>
              ) : (
                'Search Puzzles'
              )}
            </h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect puzzle from our collection of 1000+ puzzles
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search for puzzles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-24 py-4 text-lg border-2 border-border bg-card rounded-xl focus:border-primary focus:ring-primary"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-20 flex items-center px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-shine"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Recent & Popular Searches */}
          {!query && (
            <div className="mt-8 space-y-4">
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Recent:</span>
                  {recentSearches.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                {popularSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${term}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-lg">
                  <CardHeader className="p-0">
                    <div className="bg-muted aspect-[4/3] rounded-t-xl" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-5/6 mb-4" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-16" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <p className="text-muted-foreground">
                    Found <span className="font-semibold text-foreground">{searchResults.length}</span> puzzle{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((puzzle, index) => (
                  <Card 
                    key={puzzle.id} 
                    className={cn(
                      "group overflow-hidden card-hover border-0 shadow-lg",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="p-0">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={puzzle.image_url}
                          alt={puzzle.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Difficulty badge */}
                        <div className="absolute top-4 right-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                            getDifficultyStyle(puzzle.difficulty)
                          )}>
                            {puzzle.difficulty}
                          </span>
                        </div>
                        
                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-foreground backdrop-blur-sm">
                            {puzzle.category}
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
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {puzzle.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {puzzle.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Puzzle className="w-4 h-4 mr-1" />
                            {puzzle.piece_count}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
                            {puzzle.rating}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {puzzle.plays.toLocaleString()} plays
                        </span>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-1" />
                          ~{Math.round(puzzle.piece_count / 10)} min
                        </span>
                        <Link 
                          href={`/p/${puzzle.id}`}
                          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View Details →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Frown className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No puzzles found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t find any puzzles matching &quot;{query}&quot;. Try searching for something else or browse our popular categories.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Popular searches:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularSearches.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${suggestion}`}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Start your puzzle search
                </h3>
                <p className="text-muted-foreground">
                  Enter a search term above to find amazing puzzles, or browse our popular suggestions.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
