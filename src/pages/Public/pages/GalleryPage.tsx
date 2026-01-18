import { useState, useEffect } from 'react';
import { Play, X, Image as ImageIcon, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';
import { galleryService } from '@/api/services';
import type { GalleryItem, GalleryItemType } from '@/types';
import { toast } from 'sonner';

const GalleryPage = () => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const items = await galleryService.getActiveItems();
      setGalleryItems(items);
    } catch (error) {
      toast.error('Error al cargar la galería', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.type === filter);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.gallery.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.gallery.subtitle}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'photo' ? 'default' : 'outline'}
              onClick={() => setFilter('photo')}
              className="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Fotos
            </Button>
            <Button
              variant={filter === 'video' ? 'default' : 'outline'}
              onClick={() => setFilter('video')}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Videos
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Cargando galería...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay elementos para mostrar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.gallery_item_id} 
                  className="overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={item.public_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                      {item.type === 'video' && (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-primary-foreground ml-1" />
                        </div>
                      )}
                    </div>
                    <Badge className="absolute top-2 left-2 bg-card/80">
                      {item.category}
                    </Badge>
                    {item.type === 'video' && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 bg-foreground border-none">
          {selectedItem && (
            <div className="relative">
              <img 
                src={selectedItem.public_url} 
                alt={selectedItem.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground to-transparent">
                <h3 className="font-bold text-primary-foreground text-lg">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className="text-primary-foreground/80 text-sm mt-1">{selectedItem.description}</p>
                )}
                <Badge className="mt-2">{selectedItem.category}</Badge>
              </div>
              {selectedItem.type === 'video' && selectedItem.video_url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <a 
                    href={selectedItem.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="gap-2">
                      <Play className="w-6 h-6" />
                      Reproducir video
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CTA />
    </div>
  );
};

export default GalleryPage;