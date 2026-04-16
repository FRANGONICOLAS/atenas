import { useState, useMemo } from "react";
import { Search, Filter, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import CTA from "@/components/CTA";
import { usePublicBeneficiaries } from "@/hooks/usePublicData";
import {
  BeneficiaryPublic,
  BeneficiaryPublicWithDetails,
} from "@/types/beneficiary.types";
import PlayerDetailModal from "@/pages/Public/components/PlayerDetailModal";

const PlayersPage = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] =
    useState<BeneficiaryPublicWithDetails | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const {
    data: beneficiaries = [],
    isLoading: loading,
    error,
  } = usePublicBeneficiaries();

  // Función para calcular edad a partir de fecha de nacimiento
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Mapear beneficiarios a jugadores
  const players: BeneficiaryPublicWithDetails[] = useMemo(() => {
    return beneficiaries
      .filter((b) => b.status === "activo") // Solo mostrar activos
      .map((beneficiary) => ({
        id: beneficiary.beneficiary_id,
        firstName: beneficiary.first_name,
        lastName: beneficiary.last_name,
        age: calculateAge(beneficiary.birth_date),
        category: beneficiary.category,
        performance: beneficiary.performance || 0,
        photoUrl: beneficiary.photo_url,
        status: beneficiary.status,
        registryDate: beneficiary.registry_date,
        guardian: beneficiary.guardian,
        evaluations: [],
      }));
  }, [beneficiaries]);

  const categories = [
    "all",
    "Categoría 1",
    "Categoría 2",
    "Categoría 3",
    "Categoría 4",
    "Categoría 5",
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || player.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [players, searchTerm, categoryFilter]);

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      <div className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              {t.players.title}
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              {t.players.subtitle}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t.players.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t.players.categoryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? t.players.allCategories : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Players Grid */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 text-lg">
                  Ocurrió un error cargando los jugadores. Por favor intenta de
                  nuevo.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlayers.map((player) => (
                    <Card
                      key={player.id}
                      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                            <User className="w-20 h-20 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                        <Badge className="absolute top-3 right-3 bg-primary">
                          {player.category}
                        </Badge>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-bold text-xl text-primary-foreground">
                            {player.firstName} {player.lastName}
                          </h3>
                          <p className="text-primary-foreground/80">
                            {player.age} {t.players.age}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">
                              {t.players.performance}
                            </span>
                            <span className="font-bold text-foreground">
                              {player.performance}%
                            </span>
                          </div>
                          <Progress
                            value={player.performance}
                            className="h-2"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.players.memberSince}:{" "}
                          {new Date(player.registryDate).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                            },
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPlayers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      {t.players.notFound}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <PlayerDetailModal
          open={!!selectedPlayer}
          player={selectedPlayer}
          onOpenChange={() => setSelectedPlayer(null)}
        />
      </div>
      <CTA />
    </div>
  );
};

export default PlayersPage;
