'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Puzzle, Users, Star, ChevronLeft, ChevronRight, Filter, Grid3X3, List, Clock, Trophy, Crown } from 'lucide-react'
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
  category: string
}

function AllTimeContent() {
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const itemsPerPage = 12

  useEffect(() => {
    // Mock data for All-Time Best
    const mockPuzzles: PuzzleItem[] = Array.from({ length: 24 }, (_, i) => ({
      id: `at-${i + 1}`,
      title: `Legendary Puzzle ${i + 1}`,
      image_url: `https://images.unsplash.com/photo-${1506905925346 + (i * 555)}?w=400&h=300&fit=crop`,
      description: `A true classic. Rated 5 stars by thousands of players. Experience the puzzle that started it all.`,
      piece_count: [500, 1000, 2000][i % 3],
      difficulty: ['Medium', 'Hard'][i % 2] as 'Medium' | 'Hard',
      plays_count: Math.floor(Math.random() * 50000) + 10000, // Massive play counts
      rating: 4.8 + (Math.random() * 0.2), // Near perfect ratings
      created_at: new Date(Date.now() - (i * 30) * 86400000).toISOString(), // Older dates
      category: ['Masterpiece', 'Classic', 'Epic'][i % 3]
    }))

    // Sort by rating then plays
    mockPuzzles.sort((a, b) => b.rating - a.rating || b.plays_count - a.plays_count)

    setTimeout(() => {
      setPuzzles(mockPuzzles)
      setTotalPages(Math.ceil(mockPuzzles.length / itemsPerPage))
      setLoading(false)
    }, 800)
  }, [])

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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#08080c] relative overflow-hidden">
      {/* Ambient Background Glow - Gold/Amber theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 animate-fade-in">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-foreground font-medium">Hall of Fame</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 border border-amber-500/20">
                  <Trophy className="w-4 h-4 mr-2" />
                  All-Time Legends
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-200">
                  Hall of Fame
                </h1>
                <p className="text-lg text-muted-foreground dark:text-gray-400 max-w-2xl leading-relaxed">
                  The greatest collection of puzzles ever created. These legendary challenges have been solved by millions and rated purely 5 stars.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Puzzles Grid */}
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sticky top-20 z-20 bg-background/80 dark:bg-[#08080c]/80 backdrop-blur-xl p-4 rounded-2xl border border-border/50 dark:border-white/10 shadow-sm">
              <p className="text-muted-foreground text-sm">
                Showing <span className="font-semibold text-foreground dark:text-white">{paginatedPuzzles.length}</span> of{' '}
                <span className="font-semibold text-foreground dark:text-white">{puzzles.length}</span> legends
              </p>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent border-border/50 dark:border-white/10 hover:bg-accent/5">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <div className="flex items-center bg-muted/50 dark:bg-white/5 rounded-lg p-1 border border-border/50 dark:border-white/5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === 'grid' 
                        ? "bg-background dark:bg-white/10 text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-white/5"
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === 'list' 
                        ? "bg-background dark:bg-white/10 text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-white/5"
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
                      "group overflow-hidden border-0 shadow-lg cursor-pointer relative",
                      "bg-white dark:bg-[#121218]/50",
                      "backdrop-blur-sm",
                      "border border-border/50 dark:border-white/10",
                      "transition-all duration-300 ease-out",
                      "hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-amber-500/10",
                      "hover:-translate-y-1 hover:border-amber-500/20 dark:hover:border-amber-500/30",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={puzzle.image_url}
                        alt={puzzle.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      
                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3">
                         <div className={cn(
                           "flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-lg border border-white/20 backdrop-blur-md",
                           index < 3 ? "bg-amber-500" : "bg-black/50"
                         )}>
                           #{index + 1 + (currentPage - 1) * itemsPerPage}
                         </div>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg border border-white/10",
                          getDifficultyStyle(puzzle.difficulty)
                        )}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                      
                      <Link href={`/play/${puzzle.id}`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
                          <Button size="sm" className="rounded-full w-12 h-12 p-0 bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl">
                            <span className="ml-1 text-xl">▶</span>
                          </Button>
                        </div>
                      </Link>

                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-white mb-1 line-clamp-1 drop-shadow-md">
                          {puzzle.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span className="flex items-center">
                            <Puzzle className="w-3.5 h-3.5 mr-1" />
                            {puzzle.piece_count}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                            {puzzle.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {puzzle.plays_count.toLocaleString()} plays
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(puzzle.created_at).getFullYear()}
                        </span>
                      </div>
                      
                      <Link href={`/p/${puzzle.id}`} className="block">
                        <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-secondary/50 dark:hover:bg-white/5 group/btn">
                          View Details
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {paginatedPuzzles.map((puzzle, index) => (
                  <Card 
                    key={puzzle.id} 
                    className={cn(
                      "group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300",
                      "bg-white dark:bg-[#121218]/50",
                      "border border-border/50 dark:border-white/10",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                        <Image
                          src={puzzle.image_url}
                          alt={puzzle.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                         {/* Rank Badge */}
                        <div className="absolute top-3 left-3">
                           <div className={cn(
                             "flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-lg border border-white/20 backdrop-blur-md",
                             index < 3 ? "bg-amber-500" : "bg-black/50"
                           )}>
                             #{index + 1 + (currentPage - 1) * itemsPerPage}
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6 flex flex-col justify-between relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-foreground dark:text-white group-hover:text-primary transition-colors">
                              {puzzle.title}
                            </h3>
                            <div className="flex items-center bg-secondary/50 dark:bg-white/5 px-2 py-1 rounded-md">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-medium">{puzzle.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground dark:text-gray-400 mb-4 line-clamp-2">
                            {puzzle.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <span className="flex items-center text-muted-foreground dark:text-gray-400">
                              <Puzzle className="w-4 h-4 mr-2 text-primary" />
                              {puzzle.piece_count} pieces
                            </span>
                            <span className="flex items-center text-muted-foreground dark:text-gray-400">
                              <Users className="w-4 h-4 mr-2 text-primary" />
                              {puzzle.plays_count.toLocaleString()} plays
                            </span>
                            <span className="flex items-center text-muted-foreground dark:text-gray-400">
                              <Crown className="w-4 h-4 mr-2 text-amber-500" />
                              Hall of Fame
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 sm:mt-0 pt-4 border-t border-border/50 dark:border-white/5">
                          <Link href={`/p/${puzzle.id}`} className="flex-1 sm:flex-initial">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent border-border/50 dark:border-white/10 hover:bg-secondary/50 dark:hover:bg-white/5">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/play/${puzzle.id}`} className="flex-1 sm:flex-initial">
                            <Button size="sm" className="w-full sm:w-auto shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-700 text-white">
                              <Trophy className="w-4 h-4 mr-2" />
                              Challenge Legend
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
              <div className="flex justify-center mt-16">
                <nav className="flex items-center gap-2 p-2 rounded-xl bg-card/50 dark:bg-white/5 backdrop-blur-sm border border-border/50 dark:border-white/5 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="hidden sm:flex hover:bg-secondary dark:hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "min-w-[36px] h-9 rounded-lg transition-all",
                            currentPage === page 
                              ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md" 
                              : "hover:bg-secondary dark:hover:bg-white/10"
                          )}
                        >
                          {page}
                        </Button>
                      ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex hover:bg-secondary dark:hover:bg-white/10"
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
    </div>
  )
}

export default function AllTimeExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    }>
      <AllTimeContent />
    </Suspense>
  )
}
