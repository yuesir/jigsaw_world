'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, RotateCcw, Check, Clock, Grid3X3, Puzzle, Home, Maximize2, Volume2, VolumeX, Settings, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PuzzlePiece {
  id: string
  x: number
  y: number
  correctX: number
  correctY: number
  isPlaced: boolean
  isConnected: boolean
  connectedPieces: string[]
  rotation: number
}

interface PuzzleGame {
  id: string
  title: string
  image_url: string
  piece_count: number
  rows: number
  cols: number
}

export default function PlayPuzzlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  
  const [puzzle, setPuzzle] = useState<PuzzleGame | null>(null)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null)
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mockPuzzle: PuzzleGame = {
      id: slug || '1',
      title: 'Mountain Landscape',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      piece_count: 12,
      rows: 3,
      cols: 4
    }

    setTimeout(() => {
      setPuzzle(mockPuzzle)
      initializePuzzle(mockPuzzle)
    }, 500)
  }, [slug])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isCompleted])

  const initializePuzzle = (puzzleData: PuzzleGame) => {
    const newPieces: PuzzlePiece[] = []
    const pieceWidth = 100
    const pieceHeight = 100
    
    for (let row = 0; row < puzzleData.rows; row++) {
      for (let col = 0; col < puzzleData.cols; col++) {
        const piece: PuzzlePiece = {
          id: `${row}-${col}`,
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50,
          correctX: col * pieceWidth + 400,
          correctY: row * pieceHeight + 100,
          isPlaced: false,
          isConnected: false,
          connectedPieces: [],
          rotation: 0
        }
        newPieces.push(piece)
      }
    }
    
    setPieces(newPieces)
  }

  const startGame = () => {
    setIsPlaying(true)
    setTimer(0)
  }

  const pauseGame = () => {
    setIsPlaying(false)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setIsCompleted(false)
    setTimer(0)
    setProgress(0)
    setSelectedPiece(null)
    setDraggedPiece(null)
    if (puzzle) {
      initializePuzzle(puzzle)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseDown = (pieceId: string, e: React.MouseEvent) => {
    if (!isPlaying || isCompleted) return
    e.preventDefault()
    setDraggedPiece(pieceId)
    setSelectedPiece(pieceId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPiece || !gameAreaRef.current || !isPlaying) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPieces(prev => prev.map(piece => 
      piece.id === draggedPiece 
        ? { ...piece, x: x - 50, y: y - 50 }
        : piece
    ))
  }

  const handleMouseUp = () => {
    if (!draggedPiece || !isPlaying) return

    const draggedPieceData = pieces.find(p => p.id === draggedPiece)
    if (!draggedPieceData) return

    const tolerance = 30
    const isCorrectPosition = 
      Math.abs(draggedPieceData.x - draggedPieceData.correctX) < tolerance &&
      Math.abs(draggedPieceData.y - draggedPieceData.correctY) < tolerance

    if (isCorrectPosition) {
      setPieces(prev => prev.map(piece => 
        piece.id === draggedPiece 
          ? { 
              ...piece, 
              x: piece.correctX, 
              y: piece.correctY, 
              isPlaced: true 
            }
          : piece
      ))

      const placedPieces = pieces.filter(p => p.isPlaced || p.id === draggedPiece).length
      const newProgress = Math.round((placedPieces / pieces.length) * 100)
      setProgress(newProgress)

      if (newProgress === 100) {
        setIsCompleted(true)
        setIsPlaying(false)
      }
    }

    setDraggedPiece(null)
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Game Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{puzzle.title}</h1>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  {puzzle.piece_count} pieces
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{puzzle.rows}×{puzzle.cols} grid</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            {/* Timer */}
            <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-xl">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-mono font-bold text-foreground">{formatTime(timer)}</span>
            </div>
            
            {/* Progress */}
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="w-32 bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-10">{progress}%</span>
            </div>

            {/* Control buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="hidden sm:flex"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                className={cn(showPreview && "bg-primary/10 text-primary")}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {!isPlaying ? (
                <Button onClick={startGame} size="sm" className="btn-shine">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseGame} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Progress */}
        <div className="sm:hidden mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Game Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex gap-6 h-full">
            {/* Main Game Board */}
            <div 
              ref={gameAreaRef}
              className="relative flex-1 bg-card rounded-2xl shadow-lg border-2 border-dashed border-border overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Preview Image */}
              {showPreview && (
                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8">
                  <div className="relative max-w-lg w-full">
                    <Image
                      src={puzzle.image_url}
                      alt="Preview"
                      width={600}
                      height={400}
                      className="rounded-xl shadow-2xl"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-4 right-4"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Puzzle Board Area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="grid gap-1 p-4 bg-muted/30 rounded-xl"
                  style={{ 
                    gridTemplateColumns: `repeat(${puzzle.cols}, 80px)`,
                    gridTemplateRows: `repeat(${puzzle.rows}, 80px)`
                  }}
                >
                  {Array.from({ length: puzzle.piece_count }, (_, i) => (
                    <div 
                      key={i}
                      className="w-20 h-20 border-2 border-dashed border-border/50 bg-muted/50 rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Puzzle Pieces */}
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  className={cn(
                    "absolute w-20 h-20 rounded-lg cursor-grab select-none puzzle-piece shadow-md",
                    piece.isPlaced 
                      ? "bg-primary/20 border-2 border-primary/50" 
                      : "bg-gradient-to-br from-primary to-primary/80 border-2 border-primary/80",
                    selectedPiece === piece.id && !piece.isPlaced && "ring-2 ring-warning scale-105",
                    !piece.isPlaced && "hover:shadow-xl hover:scale-105"
                  )}
                  style={{
                    left: `${piece.x}px`,
                    top: `${piece.y}px`,
                    transform: draggedPiece === piece.id ? 'scale(1.1) rotate(2deg)' : piece.isPlaced ? 'scale(1)' : 'scale(1)',
                    zIndex: draggedPiece === piece.id ? 1000 : selectedPiece === piece.id ? 999 : piece.isPlaced ? 1 : 10
                  }}
                  onMouseDown={(e) => handleMouseDown(piece.id, e)}
                >
                  <div className="w-full h-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {piece.isPlaced ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <span className="drop-shadow-md">{piece.id}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Start Overlay */}
              {!isPlaying && !isCompleted && progress === 0 && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Puzzle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Start?</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Drag and drop the pieces to their correct positions. Click Start when you&apos;re ready!
                    </p>
                    <Button size="lg" onClick={startGame} className="btn-shine">
                      <Play className="w-5 h-5 mr-2" />
                      Start Puzzle
                    </Button>
                  </div>
                </div>
              )}

              {/* Completion Modal */}
              {isCompleted && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <Card className="max-w-md w-full mx-4 border-0 shadow-2xl animate-fade-in">
                    <CardHeader className="text-center pb-2">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center animate-pulse-ring">
                        <span className="text-5xl">🎉</span>
                      </div>
                      <CardTitle className="text-2xl text-success">Congratulations!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                      <div>
                        <p className="text-lg text-foreground mb-2">
                          You completed the puzzle in
                        </p>
                        <p className="text-4xl font-bold text-primary">{formatTime(timer)}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{puzzle.piece_count}</p>
                          <p className="text-xs text-muted-foreground">Pieces</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{formatTime(timer)}</p>
                          <p className="text-xs text-muted-foreground">Time</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">🏆</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={resetGame} variant="outline" className="flex-1">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Play Again
                        </Button>
                        <Button onClick={() => router.push('/')} className="flex-1">
                          <Home className="w-4 h-4 mr-2" />
                          Home
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Only visible on larger screens */}
            <div className="hidden xl:block w-64 space-y-4">
              {/* Instructions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    How to Play
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-muted-foreground">Drag pieces from the sides to the board</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-muted-foreground">Pieces snap into place when near correct position</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-muted-foreground">Complete all pieces to finish the puzzle!</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="font-mono font-semibold">{formatTime(timer)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Placed</span>
                    <span className="font-semibold">{pieces.filter(p => p.isPlaced).length}/{pieces.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Preview thumbnail */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={puzzle.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={() => setShowPreview(true)}>
                      <Maximize2 className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
