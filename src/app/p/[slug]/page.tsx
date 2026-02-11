'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Clock, Users, Star, Trophy, Calendar, Puzzle, TrendingUp, ArrowLeft, Share2, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Puzzle {
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

interface LeaderboardEntry {
  id: string
  username: string
  completion_time: number
  completed_at: string
  rank: number
  avatar: string
}

interface GameStats {
  total_plays: number
  average_completion_time: number
  completion_rate: number
  best_time: number
  total_completions: number
}

export default function PuzzleDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const mockPuzzle: Puzzle = {
      id: slug || '1',
      title: 'Mountain Landscape',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'A stunning mountain landscape puzzle that will challenge your mind and provide hours of entertainment. This beautiful scene features majestic peaks, rolling hills, and a serene atmosphere perfect for puzzle enthusiasts of all skill levels.',
      piece_count: 150,
      difficulty: 'Medium',
      plays_count: 1247,
      rating: 4.7,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Nature'
    }

    const mockLeaderboard: LeaderboardEntry[] = [
      { id: '1', username: 'PuzzleMaster', completion_time: 1800, completed_at: new Date().toISOString(), rank: 1, avatar: '👑' },
      { id: '2', username: 'SpeedSolver', completion_time: 2100, completed_at: new Date().toISOString(), rank: 2, avatar: '🥈' },
      { id: '3', username: 'QuickFingers', completion_time: 2400, completed_at: new Date().toISOString(), rank: 3, avatar: '🥉' },
      { id: '4', username: 'PuzzlePro', completion_time: 2700, completed_at: new Date().toISOString(), rank: 4, avatar: '🎯' },
      { id: '5', username: 'BrainTeaser', completion_time: 3000, completed_at: new Date().toISOString(), rank: 5, avatar: '🧩' },
    ]

    const mockGameStats: GameStats = {
      total_plays: 1247,
      average_completion_time: 3200,
      completion_rate: 68,
      best_time: 1800,
      total_completions: 848
    }

    setTimeout(() => {
      setPuzzle(mockPuzzle)
      setLeaderboard(mockLeaderboard)
      setGameStats(mockGameStats)
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-5 w-5",
          i < Math.floor(rating) ? 'star-filled' : 'star-empty'
        )}
      />
    ))
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
      case 2: return 'bg-gray-400/20 text-gray-600 border-gray-400/30'
      case 3: return 'bg-orange-600/20 text-orange-600 border-orange-600/30'
      default: return 'bg-secondary text-secondary-foreground border-border'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-muted aspect-[4/3] rounded-2xl" />
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-muted rounded-2xl" />
                <div className="h-64 bg-muted rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!puzzle || !gameStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Puzzle not found</h1>
          <p className="text-muted-foreground mb-6">The puzzle you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to puzzles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Puzzle Preview */}
            <div className="relative group">
              <Card className="overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={puzzle.image_url}
                      alt={puzzle.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm",
                        getDifficultyStyle(puzzle.difficulty)
                      )}>
                        {puzzle.difficulty}
                      </span>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white/90 text-foreground backdrop-blur-sm">
                        {puzzle.category}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className={cn(
                          "p-2.5 rounded-full backdrop-blur-sm transition-all duration-200",
                          isLiked ? "bg-red-500 text-white" : "bg-white/90 text-foreground hover:bg-white"
                        )}
                      >
                        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                      </button>
                      <button className="p-2.5 rounded-full bg-white/90 text-foreground backdrop-blur-sm hover:bg-white transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Hover play overlay */}
                    <Link href={`/play/${puzzle.id}`}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
                        <Button size="lg" className="bg-white text-foreground hover:bg-white/90 scale-90 group-hover:scale-100 transition-transform shadow-xl">
                          <Play className="w-5 h-5 mr-2 fill-current" />
                          Start Puzzle
                        </Button>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Puzzle Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{puzzle.title}</CardTitle>
                    <CardDescription className="text-base">
                      {puzzle.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 bg-secondary px-3 py-2 rounded-xl">
                    {renderStars(puzzle.rating)}
                    <span className="font-bold text-foreground ml-2">{puzzle.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Puzzle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{puzzle.piece_count}</div>
                    <div className="text-xs text-muted-foreground">Pieces</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-success/5 border border-success/10">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{gameStats.total_plays.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Plays</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-warning/5 border border-warning/10">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-warning/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{gameStats.completion_rate}%</div>
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{formatTime(gameStats.average_completion_time)}</div>
                    <div className="text-xs text-muted-foreground">Avg. Time</div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      Best Time
                    </span>
                    <span className="font-semibold text-foreground">{formatTime(gameStats.best_time)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Added
                    </span>
                    <span className="font-semibold text-foreground">{new Date(puzzle.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Play Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                <h3 className="text-xl font-bold mb-2">Ready to play?</h3>
                <p className="text-primary-foreground/80 text-sm mb-6">
                  Challenge yourself with this {puzzle.piece_count}-piece puzzle
                </p>
                <Link href={`/play/${puzzle.id}`}>
                  <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 btn-shine">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Puzzle
                  </Button>
                </Link>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    getDifficultyStyle(puzzle.difficulty)
                  )}>
                    {puzzle.difficulty}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Trophy className="h-5 w-5 mr-2 text-warning" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <div key={entry.id} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                            getRankStyle(entry.rank)
                          )}>
                            {entry.rank <= 3 ? entry.avatar : entry.rank}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{entry.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground text-sm">{formatTime(entry.completion_time)}</div>
                          <div className="text-xs text-muted-foreground">completed</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border">
                  <Button variant="ghost" className="w-full text-sm">
                    View Full Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Average Time</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatTime(gameStats.average_completion_time)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>Best Time</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatTime(gameStats.best_time)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-success h-1.5 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Total Players</span>
                    </div>
                    <span className="font-semibold text-foreground">{gameStats.total_completions.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-warning h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
