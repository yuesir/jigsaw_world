'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mountain, Waves, Building, TreePine, Palette, Camera, ArrowRight, Grid3X3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  image_url: string
  puzzle_count: number
  color: string
  darkColor: string
}

export function CategoriesSection() {
  const categories: Category[] = [
    {
      id: '1',
      name: 'Nature',
      slug: 'nature',
      description: 'Beautiful landscapes and natural scenes',
      icon: Mountain,
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      puzzle_count: 25,
      color: 'from-green-500 to-emerald-600',
      darkColor: 'from-green-400 to-emerald-500'
    },
    {
      id: '2',
      name: 'Ocean',
      slug: 'ocean',
      description: 'Stunning ocean and beach views',
      icon: Waves,
      image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      puzzle_count: 18,
      color: 'from-blue-500 to-cyan-600',
      darkColor: 'from-blue-400 to-cyan-500'
    },
    {
      id: '3',
      name: 'City',
      slug: 'city',
      description: 'Urban landscapes and cityscapes',
      icon: Building,
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      puzzle_count: 32,
      color: 'from-purple-500 to-indigo-600',
      darkColor: 'from-purple-400 to-indigo-500'
    },
    {
      id: '4',
      name: 'Forest',
      slug: 'forest',
      description: 'Peaceful forest and woodland scenes',
      icon: TreePine,
      image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=300&fit=crop',
      puzzle_count: 21,
      color: 'from-emerald-500 to-teal-600',
      darkColor: 'from-emerald-400 to-teal-500'
    },
    {
      id: '5',
      name: 'Art',
      slug: 'art',
      description: 'Artistic and creative puzzles',
      icon: Palette,
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      puzzle_count: 15,
      color: 'from-pink-500 to-rose-600',
      darkColor: 'from-pink-400 to-rose-500'
    },
    {
      id: '6',
      name: 'Photography',
      slug: 'photography',
      description: 'Stunning photographic puzzles',
      icon: Camera,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      puzzle_count: 28,
      color: 'from-amber-500 to-orange-600',
      darkColor: 'from-amber-400 to-orange-500'
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-subtle dark:bg-accent/20 text-accent mb-4 border border-accent/20">
            <Grid3X3 className="w-4 h-4 mr-1" />
            Browse
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find your perfect puzzle from our curated collections. Each category offers unique challenges and beautiful imagery.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Link key={category.id} href={`/c/${category.slug}`}>
                <Card 
                  className={cn(
                    "group overflow-hidden card-hover border-0 shadow-lg cursor-pointer",
                    "dark:bg-card dark:border dark:border-white/10",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t opacity-70 transition-opacity duration-300 group-hover:opacity-80",
                        category.color,
                        "dark:opacity-75 dark:group-hover:opacity-85"
                      )} />
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-white/30 backdrop-blur-sm flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm drop-shadow-md">
                          {category.puzzle_count} puzzles
                        </p>
                      </div>
                      
                      {/* Hover arrow */}
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 dark:bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                      Explore {category.name}
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* View All Categories Link */}
        <div className="mt-12 text-center">
          <Link 
            href="/categories"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-secondary dark:bg-secondary/80 text-secondary-foreground font-medium hover:bg-secondary/80 dark:hover:bg-secondary transition-colors"
          >
            <Grid3X3 className="w-5 h-5 mr-2" />
            View All Categories
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
