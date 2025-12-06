import { MapPin, Phone, Mail, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const LocationsPage = () => {
  const { t } = useLanguage();

  const locations = [
    {
      id: 1,
      name: 'Sede Norte',
      address: 'Calle 127 #45-67, Bogotá',
      phone: '+57 300 123 4567',
      email: 'sedenorte@fundaciondeportiva.org',
      schedule: 'Lun - Sáb: 2:00 PM - 8:00 PM',
      players: 120,
      categories: ['Semillero', 'Iniciación', 'Formación'],
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.123456789!2d-74.05!3d4.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNDInMzYuMCJOIDc0wrAwMycwMC4wIlc!5e0!3m2!1ses!2sco!4v1234567890',
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Sede Sur',
      address: 'Carrera 30 #15-20, Bogotá',
      phone: '+57 300 765 4321',
      email: 'sedesur@fundaciondeportiva.org',
      schedule: 'Lun - Sáb: 3:00 PM - 9:00 PM',
      players: 150,
      categories: ['Formación', 'Desarrollo', 'Competencia'],
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.987654321!2d-74.08!3d4.60!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMzYnMDAuMCJOIDc0wrAwNCc0OC4wIlc!5e0!3m2!1ses!2sco!4v0987654321',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Sede Occidente',
      address: 'Avenida 68 #80-15, Bogotá',
      phone: '+57 300 111 2233',
      email: 'sedeoccidente@fundaciondeportiva.org',
      schedule: 'Lun - Sáb: 2:30 PM - 8:30 PM',
      players: 95,
      categories: ['Semillero', 'Iniciación'],
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.555555555!2d-74.10!3d4.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNDAnNDguMCJOIDc0wrAwNicwMC4wIlc!5e0!3m2!1ses!2sco!4v1111111111',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.locations.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.locations.subtitle}
          </p>
        </div>
      </section>

      {/* Locations */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {locations.map((location, index) => (
              <Card key={location.id} className="overflow-hidden">
                <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Image */}
                  <div className={`relative h-64 lg:h-auto ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <img 
                      src={location.image} 
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-lg px-4 py-2">
                        {location.name}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        {location.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">Dirección</div>
                            <div className="text-muted-foreground text-sm">{location.address}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">Teléfono</div>
                            <div className="text-muted-foreground text-sm">{location.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">Email</div>
                            <div className="text-muted-foreground text-sm">{location.email}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">Horario</div>
                            <div className="text-muted-foreground text-sm">{location.schedule}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Users className="w-5 h-5 text-secondary" />
                        <span className="font-medium text-foreground">{location.players} jugadores activos</span>
                      </div>

                      <div>
                        <div className="font-medium text-foreground mb-2">Categorías disponibles:</div>
                        <div className="flex flex-wrap gap-2">
                          {location.categories.map((cat) => (
                            <Badge key={cat} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Map */}
                      <div className="mt-4 rounded-lg overflow-hidden border border-border">
                        <iframe
                          src={location.mapUrl}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mapa ${location.name}`}
                        />
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* General Map */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Todas nuestras sedes
          </h2>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127230.12345678901!2d-74.1!3d4.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMzknMDAuMCJOIDc0wrAwNicwMC4wIlc!5e0!3m2!1ses!2sco!4v9999999999"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa general de sedes"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
