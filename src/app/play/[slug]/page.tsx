'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import Image from 'next/image'
import { Play, Pause, RotateCcw, Check, Clock, Grid3X3, Puzzle, Home, Maximize2, Volume2, VolumeX, Settings, ChevronLeft, Trophy, Star, Shuffle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types for puzzle pieces with irregular shapes
interface PuzzleTab {
  side: 'top' | 'right' | 'bottom' | 'left'
  type: 'tab' | 'blank' | 'flat'
  curve: number // Random curve variation
}

interface PuzzlePiece {
  id: string
  x: number
  y: number
  correctX: number
  correctY: number
  row: number
  col: number
  isPlaced: boolean
  groupId: string | null
  width: number
  height: number
  imageX: number
  imageY: number
  tabs: {
    top: PuzzleTab | null
    right: PuzzleTab | null
    bottom: PuzzleTab | null
    left: PuzzleTab | null
  }
  rotation: number // For potential future rotation feature
  path: string // SVG path for the piece shape
}

interface PuzzleGroup {
  id: string
  pieces: string[]
  offsetX: number
  offsetY: number
}

interface PuzzleGame {
  id: string
  title: string
  image_url: string
  piece_count: number
  rows: number
  cols: number
  difficulty: 'easy' | 'medium' | 'hard'
}

// Generate random seed for consistent piece shapes
const generateSeed = (row: number, col: number, side: string) => {
  return `${row}-${col}-${side}`.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
}

// Generate a random number based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate puzzle piece path
const generatePiecePath = (
  piece: { row: number; col: number; width: number; height: number },
  tabs: { top: PuzzleTab | null; right: PuzzleTab | null; bottom: PuzzleTab | null; left: PuzzleTab | null }
): string => {
  const { width, height } = piece
  const tabSize = Math.min(width, height) * 0.2 // Tab size relative to piece size
  const curveAmount = tabSize * 0.3 // How much the curves bend

  let path = `M 0 0` // Start at top-left corner

  // Top edge
  if (tabs.top) {
    if (tabs.top.type === 'flat') {
      path += ` L ${width} 0`
    } else {
      const midX = width / 2
      const cp1x = midX - tabSize
      const cp2x = midX + tabSize
      const tabY = tabs.top.type === 'tab' ? -tabSize : tabSize
      const curve = tabs.top.curve * curveAmount

      path += ` L ${cp1x} 0`
      path += ` C ${cp1x - curve} ${tabY}, ${cp2x + curve} ${tabY}, ${cp2x} 0`
      path += ` L ${width} 0`
    }
  } else {
    path += ` L ${width} 0`
  }

  // Right edge
  if (tabs.right) {
    if (tabs.right.type === 'flat') {
      path += ` L ${width} ${height}`
    } else {
      const midY = height / 2
      const cp1y = midY - tabSize
      const cp2y = midY + tabSize
      const tabX = tabs.right.type === 'tab' ? width + tabSize : width - tabSize
      const curve = tabs.right.curve * curveAmount

      path += ` L ${width} ${cp1y}`
      path += ` C ${tabX} ${cp1y - curve}, ${tabX} ${cp2y + curve}, ${width} ${cp2y}`
      path += ` L ${width} ${height}`
    }
  } else {
    path += ` L ${width} ${height}`
  }

  // Bottom edge
  if (tabs.bottom) {
    if (tabs.bottom.type === 'flat') {
      path += ` L 0 ${height}`
    } else {
      const midX = width / 2
      const cp1x = midX + tabSize
      const cp2x = midX - tabSize
      const tabY = tabs.bottom.type === 'tab' ? height + tabSize : height - tabSize
      const curve = tabs.bottom.curve * curveAmount

      path += ` L ${cp1x} ${height}`
      path += ` C ${cp1x + curve} ${tabY}, ${cp2x - curve} ${tabY}, ${cp2x} ${height}`
      path += ` L 0 ${height}`
    }
  } else {
    path += ` L 0 ${height}`
  }

  // Left edge
  if (tabs.left) {
    if (tabs.left.type === 'flat') {
      path += ` L 0 0`
    } else {
      const midY = height / 2
      const cp1y = midY + tabSize
      const cp2y = midY - tabSize
      const tabX = tabs.left.type === 'tab' ? -tabSize : tabSize
      const curve = tabs.left.curve * curveAmount

      path += ` L 0 ${cp1y}`
      path += ` C ${tabX} ${cp1y + curve}, ${tabX} ${cp2y - curve}, 0 ${cp2y}`
      path += ` L 0 0`
    }
  } else {
    path += ` L 0 0`
  }

  path += ` Z` // Close the path
  return path
}

function PlayPuzzleContent() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [puzzle, setPuzzle] = useState<PuzzleGame | null>(null)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [groups, setGroups] = useState<PuzzleGroup[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMuted, setIsMuted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 })
  const [moves, setMoves] = useState(0)
  const [showGhostImage, setShowGhostImage] = useState(false)
  const [showEdgeOnly, setShowEdgeOnly] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Constants for puzzle mechanics
  const SNAP_DISTANCE = 25 // Reduced for more precise snapping
  const TAB_SIZE_RATIO = 0.2 // Tab size relative to piece size
  const BOARD_PADDING = 60

  // Load puzzle data
  useEffect(() => {
    // Different puzzles based on slug - default to 9 pieces (3x3)
    const puzzles: Record<string, PuzzleGame> = {
      'mountain-landscape': {
        id: '1',
        title: 'Mountain Landscape',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        piece_count: 9,
        rows: 3,
        cols: 3,
        difficulty: 'easy'
      },
      'ocean-sunset': {
        id: '2',
        title: 'Ocean Sunset',
        image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
        piece_count: 9,
        rows: 3,
        cols: 3,
        difficulty: 'easy'
      },
      'forest-path': {
        id: '3',
        title: 'Forest Path',
        image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop',
        piece_count: 16,
        rows: 4,
        cols: 4,
        difficulty: 'medium'
      },
      'city-lights': {
        id: '4',
        title: 'City Lights',
        image_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
        piece_count: 25,
        rows: 5,
        cols: 5,
        difficulty: 'hard'
      }
    }

    const selectedPuzzle = puzzles[slug] || puzzles['mountain-landscape']

    setTimeout(() => {
      setPuzzle(selectedPuzzle)
      setImageLoaded(true)
    }, 500)
  }, [slug])

  // Initialize puzzle pieces with irregular shapes
  useEffect(() => {
    if (puzzle && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect()
      const availableWidth = boardRect.width - BOARD_PADDING * 2
      const availableHeight = boardRect.height - BOARD_PADDING * 2

      // Calculate piece dimensions to fit the board
      const baseWidth = Math.floor(availableWidth / puzzle.cols)
      const baseHeight = Math.floor(availableHeight / puzzle.rows)

      // Add extra space for tabs
      const tabExtension = Math.min(baseWidth, baseHeight) * TAB_SIZE_RATIO
      const pieceWidth = baseWidth
      const pieceHeight = baseHeight

      setBoardDimensions({
        width: pieceWidth * puzzle.cols,
        height: pieceHeight * puzzle.rows
      })

      initializePuzzle(puzzle, pieceWidth, pieceHeight, tabExtension)
    }
  }, [puzzle])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isCompleted])

  const initializePuzzle = (puzzleData: PuzzleGame, pieceWidth: number, pieceHeight: number, tabExtension: number) => {
    const newPieces: PuzzlePiece[] = []
    const tabConnections: Record<string, { type: 'tab' | 'blank', curve: number }> = {}

    // Generate tab connections first to ensure matching pieces
    for (let row = 0; row < puzzleData.rows; row++) {
      for (let col = 0; col < puzzleData.cols; col++) {
        // Horizontal connections (right side of current piece)
        if (col < puzzleData.cols - 1) {
          const seed = generateSeed(row, col, 'h')
          const isTab = seededRandom(seed) > 0.5
          const curve = seededRandom(seed + 1) * 0.6 + 0.2 // 0.2 to 0.8
          tabConnections[`${row}-${col}-h`] = { type: isTab ? 'tab' : 'blank', curve }
        }

        // Vertical connections (bottom side of current piece)
        if (row < puzzleData.rows - 1) {
          const seed = generateSeed(row, col, 'v')
          const isTab = seededRandom(seed) > 0.5
          const curve = seededRandom(seed + 1) * 0.6 + 0.2
          tabConnections[`${row}-${col}-v`] = { type: isTab ? 'tab' : 'blank', curve }
        }
      }
    }

    // Get game area dimensions
    const gameArea = gameAreaRef.current
    if (!gameArea) return

    const gameAreaRect = gameArea.getBoundingClientRect()
    const centerX = gameAreaRect.width / 2
    const centerY = gameAreaRect.height / 2

    // Calculate board position (centered)
    const boardX = centerX - (pieceWidth * puzzleData.cols) / 2
    const boardY = centerY - (pieceHeight * puzzleData.rows) / 2

    // Create pieces with proper tab configurations
    for (let row = 0; row < puzzleData.rows; row++) {
      for (let col = 0; col < puzzleData.cols; col++) {
        // Determine tabs for this piece
        const tabs = {
          top: row === 0 ? { side: 'top' as const, type: 'flat' as const, curve: 0 } :
               (tabConnections[`${row-1}-${col}-v`] ?
                { side: 'top' as const,
                  type: tabConnections[`${row-1}-${col}-v`].type === 'tab' ? 'blank' as const : 'tab' as const,
                  curve: tabConnections[`${row-1}-${col}-v`].curve } : null),

          right: col === puzzleData.cols - 1 ? { side: 'right' as const, type: 'flat' as const, curve: 0 } :
                 (tabConnections[`${row}-${col}-h`] ?
                  { side: 'right' as const,
                    type: tabConnections[`${row}-${col}-h`].type,
                    curve: tabConnections[`${row}-${col}-h`].curve } : null),

          bottom: row === puzzleData.rows - 1 ? { side: 'bottom' as const, type: 'flat' as const, curve: 0 } :
                  (tabConnections[`${row}-${col}-v`] ?
                   { side: 'bottom' as const,
                     type: tabConnections[`${row}-${col}-v`].type,
                     curve: tabConnections[`${row}-${col}-v`].curve } : null),

          left: col === 0 ? { side: 'left' as const, type: 'flat' as const, curve: 0 } :
                (tabConnections[`${row}-${col-1}-h`] ?
                 { side: 'left' as const,
                   type: tabConnections[`${row}-${col-1}-h`].type === 'tab' ? 'blank' as const : 'tab' as const,
                   curve: tabConnections[`${row}-${col-1}-h`].curve } : null)
        }

        // Generate SVG path for the piece
        const piecePath = generatePiecePath(
          { row, col, width: pieceWidth, height: pieceHeight },
          tabs
        )

        // Scatter pieces randomly around the game area
        const margin = tabExtension + 20
        const scatteredX = margin + Math.random() * (gameAreaRect.width - pieceWidth - tabExtension * 2 - margin * 2)
        const scatteredY = margin + Math.random() * (gameAreaRect.height - pieceHeight - tabExtension * 2 - margin * 2)

        const piece: PuzzlePiece = {
          id: `${row}-${col}`,
          x: scatteredX,
          y: scatteredY,
          correctX: boardX + col * pieceWidth,
          correctY: boardY + row * pieceHeight,
          row,
          col,
          isPlaced: false,
          groupId: null,
          width: pieceWidth,
          height: pieceHeight,
          imageX: col * pieceWidth,
          imageY: row * pieceHeight,
          tabs,
          rotation: 0,
          path: piecePath
        }
        newPieces.push(piece)
      }
    }

    // Shuffle pieces more dramatically
    const shuffledPieces = [...newPieces].sort(() => Math.random() - 0.5)

    setPieces(shuffledPieces)
    setGroups([])
    setProgress(0)
    setMoves(0)
  }

  const startGame = () => {
    setIsPlaying(true)
    setTimer(0)
    setMoves(0)
  }

  const pauseGame = () => {
    setIsPlaying(false)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setIsCompleted(false)
    setTimer(0)
    setProgress(0)
    setMoves(0)
    setDraggedGroup(null)
    setShowGhostImage(false)
    setShowEdgeOnly(false)
    if (puzzle && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect()
      const availableWidth = boardRect.width - BOARD_PADDING * 2
      const availableHeight = boardRect.height - BOARD_PADDING * 2
      const pieceWidth = Math.floor(availableWidth / puzzle.cols)
      const pieceHeight = Math.floor(availableHeight / puzzle.rows)
      const tabExtension = Math.min(pieceWidth, pieceHeight) * TAB_SIZE_RATIO
      initializePuzzle(puzzle, pieceWidth, pieceHeight, tabExtension)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPieceOrGroupPosition = useCallback((pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId)
    if (!piece) return { x: 0, y: 0 }

    if (piece.groupId) {
      const group = groups.find(g => g.id === piece.groupId)
      if (group) {
        // Calculate relative position within the group
        const firstPiece = pieces.find(p => p.id === group.pieces[0])
        if (firstPiece) {
          const relativeX = (piece.col - firstPiece.col) * piece.width
          const relativeY = (piece.row - firstPiece.row) * piece.height
          return {
            x: group.offsetX + relativeX,
            y: group.offsetY + relativeY
          }
        }
      }
    }

    return { x: piece.x, y: piece.y }
  }, [pieces, groups])

  const handleMouseDown = (pieceId: string, e: React.MouseEvent) => {
    if (!isPlaying || isCompleted) return
    e.preventDefault()
    e.stopPropagation()

    const piece = pieces.find(p => p.id === pieceId)
    if (!piece) return

    const position = getPieceOrGroupPosition(pieceId)
    const rect = gameAreaRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragOffset({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    })

    if (piece.groupId) {
      // Bring the entire group to front
      const groupToFront = groups.find(g => g.id === piece.groupId)
      if (groupToFront) {
        setGroups(prev => [
          ...prev.filter(g => g.id !== piece.groupId),
          groupToFront
        ])
      }
      setDraggedGroup(piece.groupId)
    } else {
      // Create a new group for single piece
      const newGroupId = `group-${Date.now()}`
      setPieces(prev => prev.map(p =>
        p.id === pieceId ? { ...p, groupId: newGroupId } : p
      ))
      const newGroup = {
        id: newGroupId,
        pieces: [pieceId],
        offsetX: piece.x,
        offsetY: piece.y
      }
      setGroups(prev => [...prev, newGroup])
      setDraggedGroup(newGroupId)
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedGroup || !gameAreaRef.current || !isPlaying) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    setGroups(prev => prev.map(group =>
      group.id === draggedGroup
        ? { ...group, offsetX: x, offsetY: y }
        : group
    ))
  }, [draggedGroup, dragOffset, isPlaying])

  const checkAndSnapPieces = useCallback(() => {
    if (!draggedGroup || !puzzle) return

    const draggedGroupData = groups.find(g => g.id === draggedGroup)
    if (!draggedGroupData) return

    let updated = false
    let newGroups = [...groups]
    let newPieces = [...pieces]

    // Get all pieces in the dragged group
    const groupPieces = draggedGroupData.pieces.map(id => newPieces.find(p => p.id === id)).filter(Boolean) as PuzzlePiece[]

    // Check each piece in the group for connections and correct placement
    groupPieces.forEach(piece => {
      const position = getPieceOrGroupPosition(piece.id)

      // Check if piece is near its correct position
      if (!piece.isPlaced &&
          Math.abs(position.x - piece.correctX) < SNAP_DISTANCE &&
          Math.abs(position.y - piece.correctY) < SNAP_DISTANCE) {

        // Snap entire group to align this piece correctly
        const groupIndex = newGroups.findIndex(g => g.id === draggedGroup)
        if (groupIndex !== -1) {
          const offsetAdjustmentX = piece.correctX - position.x
          const offsetAdjustmentY = piece.correctY - position.y

          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            offsetX: newGroups[groupIndex].offsetX + offsetAdjustmentX,
            offsetY: newGroups[groupIndex].offsetY + offsetAdjustmentY
          }

          // Mark all pieces in correct position as placed
          draggedGroupData.pieces.forEach(pId => {
            const p = newPieces.find(pc => pc.id === pId)
            if (p) {
              const pPos = getPieceOrGroupPosition(p.id)
              if (Math.abs(pPos.x + offsetAdjustmentX - p.correctX) < 5 &&
                  Math.abs(pPos.y + offsetAdjustmentY - p.correctY) < 5) {
                const pIndex = newPieces.findIndex(pc => pc.id === pId)
                if (pIndex !== -1) {
                  newPieces[pIndex] = { ...newPieces[pIndex], isPlaced: true }
                  updated = true
                }
              }
            }
          })
        }
      }

      // Check for connections with adjacent pieces
      const adjacentPositions = [
        { row: piece.row - 1, col: piece.col, dx: 0, dy: -piece.height }, // Top
        { row: piece.row + 1, col: piece.col, dx: 0, dy: piece.height },  // Bottom
        { row: piece.row, col: piece.col - 1, dx: -piece.width, dy: 0 },  // Left
        { row: piece.row, col: piece.col + 1, dx: piece.width, dy: 0 }    // Right
      ]

      adjacentPositions.forEach(({ row, col, dx, dy }) => {
        if (row < 0 || row >= puzzle.rows || col < 0 || col >= puzzle.cols) return

        const adjacentPiece = newPieces.find(p => p.row === row && p.col === col)
        if (!adjacentPiece || adjacentPiece.groupId === piece.groupId) return

        const adjacentPos = getPieceOrGroupPosition(adjacentPiece.id)
        const currentPos = getPieceOrGroupPosition(piece.id)

        const actualDx = adjacentPos.x - currentPos.x
        const actualDy = adjacentPos.y - currentPos.y

        // Check if pieces are close enough to connect
        if (Math.abs(actualDx - dx) < SNAP_DISTANCE &&
            Math.abs(actualDy - dy) < SNAP_DISTANCE) {

          // Merge groups
          if (adjacentPiece.groupId) {
            const adjacentGroup = newGroups.find(g => g.id === adjacentPiece.groupId)
            if (adjacentGroup) {
              // Calculate the offset to align pieces perfectly
              const snapOffsetX = actualDx - dx
              const snapOffsetY = actualDy - dy

              // Adjust dragged group position to snap perfectly
              const draggedGroupIndex = newGroups.findIndex(g => g.id === draggedGroup)
              if (draggedGroupIndex !== -1) {
                newGroups[draggedGroupIndex].offsetX -= snapOffsetX
                newGroups[draggedGroupIndex].offsetY -= snapOffsetY
              }

              // Add all pieces from adjacent group to dragged group
              adjacentGroup.pieces.forEach(apId => {
                const apIndex = newPieces.findIndex(p => p.id === apId)
                if (apIndex !== -1) {
                  newPieces[apIndex] = { ...newPieces[apIndex], groupId: draggedGroup }
                }
              })

              // Update dragged group with new pieces
              if (draggedGroupIndex !== -1) {
                newGroups[draggedGroupIndex].pieces = [
                  ...newGroups[draggedGroupIndex].pieces,
                  ...adjacentGroup.pieces
                ]
              }

              // Remove the adjacent group
              newGroups = newGroups.filter(g => g.id !== adjacentPiece.groupId)
              updated = true

              // Play connection sound
              if (!isMuted) {
                const audio = new Audio('/sounds/connect.mp3')
                audio.volume = 0.3
                audio.play().catch(() => {})
              }
            }
          } else {
            // Adjacent piece has no group, add it to dragged group
            const snapOffsetX = actualDx - dx
            const snapOffsetY = actualDy - dy

            // Adjust dragged group position
            const draggedGroupIndex = newGroups.findIndex(g => g.id === draggedGroup)
            if (draggedGroupIndex !== -1) {
              newGroups[draggedGroupIndex].offsetX -= snapOffsetX
              newGroups[draggedGroupIndex].offsetY -= snapOffsetY
              newGroups[draggedGroupIndex].pieces.push(adjacentPiece.id)
            }

            // Add piece to group
            const apIndex = newPieces.findIndex(p => p.id === adjacentPiece.id)
            if (apIndex !== -1) {
              newPieces[apIndex] = { ...newPieces[apIndex], groupId: draggedGroup }
            }
            updated = true
          }
        }
      })
    })

    if (updated) {
      setPieces(newPieces)
      setGroups(newGroups)
      setMoves(prev => prev + 1)

      // Calculate progress
      const placedCount = newPieces.filter(p => p.isPlaced).length
      const newProgress = Math.round((placedCount / newPieces.length) * 100)
      setProgress(newProgress)

      // Check for completion
      if (placedCount === newPieces.length) {
        setIsCompleted(true)
        setIsPlaying(false)

        if (!isMuted) {
          const audio = new Audio('/sounds/complete.mp3')
          audio.volume = 0.5
          audio.play().catch(() => {})
        }
      }
    }
  }, [draggedGroup, groups, pieces, puzzle, isMuted, getPieceOrGroupPosition])

  const handleMouseUp = useCallback(() => {
    if (!draggedGroup || !isPlaying) return

    checkAndSnapPieces()
    setDraggedGroup(null)
  }, [draggedGroup, isPlaying, checkAndSnapPieces])

  // Global mouse event listeners
  useEffect(() => {
    if (draggedGroup) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedGroup, handleMouseMove, handleMouseUp])

  const calculateStars = () => {
    if (!puzzle) return 0
    const timePerPiece = timer / puzzle.piece_count
    const movesPerPiece = moves / puzzle.piece_count

    // Adjusted star rating for different puzzle sizes
    if (puzzle.piece_count <= 9) {
      // For 9-piece puzzles (3x3)
      if (timePerPiece < 20 && movesPerPiece < 3) return 3
      if (timePerPiece < 30 && movesPerPiece < 5) return 2
      return 1
    } else if (puzzle.piece_count <= 16) {
      // For 16-piece puzzles (4x4)
      if (timePerPiece < 15 && movesPerPiece < 4) return 3
      if (timePerPiece < 25 && movesPerPiece < 6) return 2
      return 1
    } else {
      // For larger puzzles
      if (timePerPiece < 12 && movesPerPiece < 5) return 3
      if (timePerPiece < 20 && movesPerPiece < 8) return 2
      return 1
    }
  }

  const renderPuzzlePiece = (piece: PuzzlePiece) => {
    const position = getPieceOrGroupPosition(piece.id)
    const isDragging = groups.find(g => g.id === draggedGroup)?.pieces.includes(piece.id)
    const zIndex = isDragging ? 1000 : piece.isPlaced ? 1 : groups.findIndex(g => g.id === piece.groupId) + 10

    const tabExtension = Math.min(piece.width, piece.height) * TAB_SIZE_RATIO

    // Calculate total puzzle dimensions
    const totalPuzzleWidth = piece.width * (puzzle?.cols || 1)
    const totalPuzzleHeight = piece.height * (puzzle?.rows || 1)

    // For edge pieces, we need to adjust how we sample the image
    // to avoid showing areas outside the image bounds
    const isLeftEdge = piece.col === 0
    const isRightEdge = piece.col === (puzzle?.cols || 1) - 1
    const isTopEdge = piece.row === 0
    const isBottomEdge = piece.row === (puzzle?.rows || 1) - 1

    // Calculate the actual image sampling area
    // Start with the normal piece position
    let srcX = piece.imageX
    let srcY = piece.imageY
    let destX = 0
    let destY = 0

    // Adjust for tabs but respect image boundaries
    if (!isLeftEdge) {
      srcX -= tabExtension
      destX = -tabExtension
    }
    if (!isTopEdge) {
      srcY -= tabExtension
      destY = -tabExtension
    }

    // Calculate the source width and height
    let srcWidth = piece.width
    let srcHeight = piece.height

    if (!isLeftEdge) srcWidth += tabExtension
    if (!isRightEdge) srcWidth += tabExtension
    if (!isTopEdge) srcHeight += tabExtension
    if (!isBottomEdge) srcHeight += tabExtension

    return (
      <div
        key={piece.id}
        className={cn(
          "absolute cursor-grab select-none",
          isDragging && "cursor-grabbing",
          piece.isPlaced && !showEdgeOnly && "pointer-events-none"
        )}
        style={{
          left: `${position.x - tabExtension}px`,
          top: `${position.y - tabExtension}px`,
          width: `${piece.width + tabExtension * 2}px`,
          height: `${piece.height + tabExtension * 2}px`,
          zIndex,
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.2s',
          filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' :
                  piece.isPlaced ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}
        onMouseDown={(e) => handleMouseDown(piece.id, e)}
      >
        <svg
          width={piece.width + tabExtension * 2}
          height={piece.height + tabExtension * 2}
          viewBox={`${-tabExtension} ${-tabExtension} ${piece.width + tabExtension * 2} ${piece.height + tabExtension * 2}`}
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Define the clipping mask for both fill and image */}
            <mask id={`mask-${piece.id}`}>
              <rect x={-tabExtension * 2} y={-tabExtension * 2}
                    width={piece.width + tabExtension * 4}
                    height={piece.height + tabExtension * 4}
                    fill="black" />
              <path d={piece.path} fill="white" />
            </mask>
            <clipPath id={`clip-${piece.id}`}>
              <path d={piece.path} />
            </clipPath>
            {showEdgeOnly && (
              <pattern id={`pattern-${piece.id}`} x="0" y="0" width="100%" height="100%">
                <image
                  href={puzzle?.image_url}
                  x={-srcX}
                  y={-srcY}
                  width={totalPuzzleWidth}
                  height={totalPuzzleHeight}
                  opacity={0.3}
                />
              </pattern>
            )}
          </defs>

          {/* Dark background to prevent white edges */}
          <rect
            x={-tabExtension * 2}
            y={-tabExtension * 2}
            width={piece.width + tabExtension * 4}
            height={piece.height + tabExtension * 4}
            fill="#1a1a1a"
            mask={`url(#mask-${piece.id})`}
          />

          {/* Piece shape with image */}
          <g clipPath={`url(#clip-${piece.id})`}>
            {!showEdgeOnly ? (
              <image
                href={puzzle?.image_url}
                x={destX - srcX}
                y={destY - srcY}
                width={totalPuzzleWidth}
                height={totalPuzzleHeight}
                style={{
                  opacity: piece.isPlaced ? 1 : 0.95
                }}
                preserveAspectRatio="none"
              />
            ) : (
              <rect
                x={-tabExtension}
                y={-tabExtension}
                width={piece.width + tabExtension * 2}
                height={piece.height + tabExtension * 2}
                fill={`url(#pattern-${piece.id})`}
              />
            )}
          </g>

          {/* Piece outline */}
          <path
            d={piece.path}
            fill="none"
            stroke={piece.isPlaced ? '#22c55e' : isDragging ? '#3b82f6' : '#94a3b8'}
            strokeWidth={piece.isPlaced ? 2 : 1}
            strokeLinejoin="round"
            opacity={showEdgeOnly ? 1 : 0.5}
          />

          {/* Success indicator */}
          {piece.isPlaced && !showEdgeOnly && (
            <g transform={`translate(${piece.width / 2}, ${piece.height / 2})`}>
              <circle r="15" fill="rgba(34, 197, 94, 0.9)" />
              <path
                d="M -6 0 L -2 4 L 6 -4"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </svg>
      </div>
    )
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-muted dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-background flex flex-col">
      {/* Game Header */}
      <header className="bg-card dark:bg-card/80 border-b border-border dark:border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hidden sm:flex dark:hover:bg-white/10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{puzzle.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Puzzle className="h-4 w-4 mr-1" />
                  {puzzle.piece_count} pieces
                </span>
                <span className="hidden sm:inline">•</span>
                <span className={cn(
                  "hidden sm:inline px-2 py-0.5 rounded text-xs font-medium",
                  puzzle.difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  puzzle.difficulty === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  puzzle.difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {puzzle.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-secondary dark:bg-secondary/50 px-4 py-2 rounded-xl">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-mono font-bold text-foreground">{formatTime(timer)}</span>
            </div>

            {/* Progress */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="w-32 bg-secondary dark:bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-10">{progress}%</span>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGhostImage(!showGhostImage)}
                className={cn(showGhostImage && "bg-primary/10 text-primary dark:bg-primary/20", "dark:hover:bg-white/10")}
                title="Show ghost image"
              >
                {showGhostImage ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEdgeOnly(!showEdgeOnly)}
                className={cn(showEdgeOnly && "bg-primary/10 text-primary dark:bg-primary/20", "dark:hover:bg-white/10")}
                title="Edge only mode"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="hidden sm:flex dark:hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                className={cn(showPreview && "bg-primary/10 text-primary dark:bg-primary/20", "dark:hover:bg-white/10")}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {!isPlaying ? (
                <Button onClick={startGame} size="sm" className="btn-shine">
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseGame} variant="outline" size="sm" className="dark:bg-transparent">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}

              <Button onClick={resetGame} variant="outline" size="sm" className="dark:bg-transparent">
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
          <div className="w-full bg-secondary dark:bg-secondary/50 rounded-full h-2 overflow-hidden">
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
              className="relative flex-1 bg-card dark:bg-card/80 rounded-2xl shadow-lg overflow-hidden select-none"
              style={{ cursor: draggedGroup ? 'grabbing' : 'auto' }}
            >
              {/* Preview Image */}
              {showPreview && (
                <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
                  <div className="relative max-w-2xl w-full">
                    <Image
                      src={puzzle.image_url}
                      alt="Preview"
                      width={800}
                      height={600}
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

              {/* Ghost Image Background */}
              <div
                ref={boardRef}
                className="absolute inset-0 flex items-center justify-center"
              >
                {showGhostImage && (
                  <div
                    className="absolute"
                    style={{
                      width: boardDimensions.width,
                      height: boardDimensions.height,
                      opacity: 0.15
                    }}
                  >
                    <Image
                      src={puzzle.image_url}
                      alt="Ghost"
                      width={boardDimensions.width}
                      height={boardDimensions.height}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Puzzle Pieces */}
              {pieces.map((piece) => renderPuzzlePiece(piece))}

              {/* Start Overlay */}
              {!isPlaying && !isCompleted && progress === 0 && (
                <div className="absolute inset-0 bg-card/80 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center z-[1500]">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary-subtle dark:bg-primary/20 flex items-center justify-center">
                      <Puzzle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Traditional Jigsaw Puzzle</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Drag and drop the irregular pieces to complete the puzzle. Pieces will snap together automatically when positioned correctly!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button size="lg" onClick={startGame} className="btn-shine">
                        <Play className="w-5 h-5 mr-2" />
                        Start Puzzle
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Modal */}
              {isCompleted && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1500]">
                  <Card className="max-w-md w-full mx-4 border-0 shadow-2xl animate-fade-in dark:bg-card dark:border dark:border-white/10">
                    <CardHeader className="text-center pb-2">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-subtle dark:bg-success/20 flex items-center justify-center animate-pulse-ring">
                        <Trophy className="w-10 h-10 text-success" />
                      </div>
                      <CardTitle className="text-2xl text-success">Puzzle Completed!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                      <div>
                        <p className="text-lg text-foreground mb-2">
                          Outstanding work! You've mastered this puzzle!
                        </p>
                        <p className="text-4xl font-bold text-primary mb-2">{formatTime(timer)}</p>
                        <div className="flex justify-center gap-1 mb-4">
                          {[...Array(3)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-8 h-8 transition-all",
                                i < calculateStars()
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-y border-border dark:border-white/10">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{puzzle.piece_count}</p>
                          <p className="text-xs text-muted-foreground">Pieces</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{moves}</p>
                          <p className="text-xs text-muted-foreground">Moves</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{calculateStars()}</p>
                          <p className="text-xs text-muted-foreground">Stars</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={resetGame} variant="outline" className="flex-1 dark:bg-transparent">
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

            {/* Sidebar */}
            <div className="hidden xl:block w-64 space-y-4">
              {/* Preview thumbnail */}
              <Card className="border-0 shadow-lg overflow-hidden dark:bg-card dark:border dark:border-white/10">
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
                      View Full
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Tips */}
              <Card className="border-0 shadow-lg dark:bg-card dark:border dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>• Start with edge pieces</p>
                  <p>• Look for unique colors or patterns</p>
                  <p>• Use ghost image for reference</p>
                  <p>• Toggle edge mode to focus on shapes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlayPuzzlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <PlayPuzzleContent />
    </Suspense>
  )
}