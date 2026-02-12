'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Puzzle, Users, Star, ChevronLeft, ChevronRight, Filter, Grid3X3, List, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PuzzleItem {
  id: string
  title: string
  image_url: string
  description: string
  piece_count: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  plays_count: number
  rating: number
  created_at: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  puzzle_count: number
  icon: string
}

function CategoryContent() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const itemsPerPage = 12

  useEffect(() => {
    const mockCategory: Category = {
      id: '1',
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      description: `Beautiful ${slug} puzzles to challenge your mind. Explore our collection of carefully curated puzzles featuring stunning ${slug} imagery.`,
      puzzle_count: 24,
      icon: '🏞️'
    }

    const mockPuzzles: PuzzleItem[] = Array.from({ length: 24 }, (_, i) => ({
      id: `${i + 1}`,
      title: `${mockCategory.name} Puzzle ${i + 1}`,
      image_url: `https://images.unsplash.com/photo-${1506905925346 + i}?w=400&h=300&fit=crop`,
      description: `A beautiful ${slug} puzzle with ${100 + (i * 10)} pieces`,
      piece_count: 100 + (i * 10),
      difficulty: ['Easy', 'Medium', 'Hard'][i % 3] as 'Easy' | 'Medium' | 'Hard',
      plays_count: Math.floor(Math.random() * 5000) + 100,
      rating: 4 + (Math.random() * 1),
      created_at: new Date(Date.now() - i * 86400000).toISOString()
    }))

    setTimeout(() => {
      setCategory(mockCategory)
      setPuzzles(mockPuzzles)
      setTotalPages(Math.ceil(mockPuzzles.length / itemsPerPage))
      setLoading(false)
    }, 800)
  }, [slug])

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy'
      case 'Medium': return 'difficulty-medium'
      case 'Hard': return 'difficulty-hard'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const paginatedPuzzles = puzzles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3.5 w-3.5",
          i < Math.floor(rating) ? 'star-filled' : 'star-empty'
        )}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 dark:bg-secondary/20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-secondary dark:bg-secondary/50 rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-secondary dark:bg-secondary/50 rounded w-96 mx-auto" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 dark:border dark:border-white/10 dark:bg-card">
                <CardHeader className="p-0">
                  <div className="bg-secondary dark:bg-secondary/30 aspect-[4/3] rounded-t-xl" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-4 bg-secondary dark:bg-secondary/30 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary dark:bg-secondary/30 rounded w-full mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-secondary dark:bg-secondary/30 rounded w-16" />
                    <div className="h-3 bg-secondary dark:bg-secondary/30 rounded w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <section className="relative bg-muted/30 dark:bg-secondary/20 border-b border-border overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 dark:bg-accent/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <Link 
              href="/categories"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Categories
            </Link>
            
            <div className="text-5xl mb-4">{category.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {category.name} Puzzles
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {category.description}
            </p>
            
            <div className="flex items-center justify-center gap-6">
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-primary-subtle dark:bg-primary/20 mx-auto mb-2 w-fit">
                  <Puzzle className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{category.puzzle_count}</p>
                <p className="text-xs text-muted-foreground">Puzzles</p>
              </div>
              
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-success-subtle dark:bg-success/20 mx-auto mb-2 w-fit">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">12.5K</p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
              
              <div className="stat-card">
                <div className="p-2 rounded-lg bg-warning-subtle dark:bg-warning/20 mx-auto mb-2 w-fit">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-foreground">25min</p>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Puzzles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{paginatedPuzzles.length}</span> of{' '}
              <span className="font-semibold text-foreground">{puzzles.length}</span> puzzles
            </p>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex dark:bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <div className="flex items-center border rounded-lg p-1 dark:border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'grid' ? "bg-secondary dark:bg-secondary/50" : "hover:bg-secondary/50 dark:hover:bg-secondary/30"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'list' ? "bg-secondary dark:bg-secondary/50" : "hover:bg-secondary/50 dark:hover:bg-secondary/30"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedPuzzles.map((puzzle, index) => (
                <Card 
                  key={puzzle.id} 
                  className={cn(
                    "group overflow-hidden card-hover border-0 shadow-lg",
                    "dark:bg-card dark:border dark:border-white/10",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={puzzle.image_url}
                        alt={puzzle.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                          getDifficultyStyle(puzzle.difficulty)
                        )}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                      
                      {/* Hover play button */}
                      <Link href={`/play/${puzzle.id}`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button size="sm" className="bg-white text-foreground hover:bg-white/90">
                            <span className="mr-1">▶</span>
                            Play
                          </Button>
                        </div>
                      </Link>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {puzzle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {puzzle.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center text-muted-foreground">
                          <Puzzle className="w-3.5 h-3.5 mr-1" />
                          {puzzle.piece_count}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {puzzle.plays_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {renderStars(puzzle.rating)}
                        <span className="ml-1 text-xs text-muted-foreground">{puzzle.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {paginatedPuzzles.map((puzzle) => (
                <Card 
                  key={puzzle.id} 
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 dark:bg-card dark:border dark:border-white/10"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                      <Image
                        src={puzzle.image_url}
                        alt={puzzle.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                          getDifficultyStyle(puzzle.difficulty)
                        )}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {puzzle.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {puzzle.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Puzzle className="w-4 h-4 mr-1" />
                            {puzzle.piece_count} pieces
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {puzzle.plays_count.toLocaleString()} plays
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
                            {puzzle.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4 sm:mt-0">
                        <Link href={`/p/${puzzle.id}`} className="flex-1 sm:flex-initial">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto dark:bg-transparent">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/play/${puzzle.id}`} className="flex-1 sm:flex-initial">
                          <Button size="sm" className="w-full sm:w-auto">
                            Play Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="hidden sm:flex dark:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px] dark:bg-transparent"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex dark:bg-transparent"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  )
}
