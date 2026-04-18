import { useState, useMemo, useRef, useEffect } from "react";
import { headquarterService, beneficiaryService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import L from "leaflet";
import { toast } from "sonner";
import type { Headquarter } from "@/types";
import type { Beneficiary } from "@/types/beneficiary.types";
import { FIVE_MINUTES_MS, getTimedCache, setTimedCache } from "@/lib/timedCache";

const HEADQUARTERS_CACHE_KEY = "headquarters:all";
const BENEFICIARIES_CACHE_KEY = "beneficiaries:all";

const defaultForm = {
  name: "",
  status: "active",
  address: "",
  city: "",
  image_url: null as string | null,
};

const createCustomMarkerIcon = (status: string = "active") => {
  const color = status === "maintenance" ? "#23a55a" : "#0284c7";
  
  return L.divIcon({
    html: `<svg width='32' height='40' viewBox='0 0 32 40' xmlns='http://www.w3.org/2000/svg' style='filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))'>
      <path d='M16 0C7.73 0 1 6.73 1 15c0 10 15 25 15 25s15-15 15-25c0-8.27-6.73-15-15-15z' fill='${color}' stroke='white' stroke-width='1'/>
      <circle cx='16' cy='15' r='5' fill='white'/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: "custom-marker",
  });
};

export const useHeadquarters = () => {
  const { user } = useAuth();
  const cachedHeadquarters = getTimedCache<Headquarter[]>(HEADQUARTERS_CACHE_KEY);
  const cachedBeneficiaries = getTimedCache<Beneficiary[]>(BENEFICIARIES_CACHE_KEY);

  const [headquarters, setHeadquarters] = useState<Headquarter[]>(cachedHeadquarters ?? []);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(cachedBeneficiaries ?? []);
  const [loading, setLoading] = useState(!cachedHeadquarters);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Headquarter | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<Headquarter | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedHeadquarter, setSelectedHeadquarter] = useState<Headquarter | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.FeatureGroup | null>(null);
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number } | null>>(new Map());

  // Load headquarters
  useEffect(() => {
    void loadHeadquarters();
    void loadBeneficiaries();
  }, []);

  const loadHeadquarters = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Headquarter[]>(HEADQUARTERS_CACHE_KEY);
        if (cached) {
          setHeadquarters(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const data = await headquarterService.getAll();
      setHeadquarters(data);
      setTimedCache(HEADQUARTERS_CACHE_KEY, data, FIVE_MINUTES_MS);
    } catch (error) {
      toast.error("Error al cargar las sedes");
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Beneficiary[]>(BENEFICIARIES_CACHE_KEY);
        if (cached) {
          setBeneficiaries(cached);
          return;
        }
      }

      const data = await beneficiaryService.getAll();
      setBeneficiaries(data);
      setTimedCache(BENEFICIARIES_CACHE_KEY, data, FIVE_MINUTES_MS);
    } catch (error) {
    }
  };

  // Initialize map once loading is done and the container is in the DOM
  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;

    // Default center (Cali, Colombia)
    const defaultCenter: [number, number] = [3.4516, -76.5320];

    // Create map
    const map = L.map(mapRef.current).setView(defaultCenter, 12);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerGroupRef.current = null;
    };
  }, [loading]);

  // Update markers when headquarters change
  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    if (markerGroupRef.current) {
      map.removeLayer(markerGroupRef.current);
    }

    // Process headquarters and geocode if needed
    const processHeadquarters = async () => {
      // Filtrar sedes activas y en mantenimiento
      const visibleHeadquarters = headquarters.filter(
        hq => hq.status === "active" || hq.status === "maintenance"
      );
      
      const coordinatesPromises = visibleHeadquarters.map(async (hq) => {
        // Requiere dirección para geocoding
        if (!hq.address) {
          return null;
        }

        // Crear clave de caché combinando dirección y ciudad
        const cacheKey = `${hq.address.toLowerCase()}_${(hq.city || "").toLowerCase()}`;
        
        // Check cache first
        if (geocodeCacheRef.current.has(cacheKey)) {
          const cached = geocodeCacheRef.current.get(cacheKey);
          if (cached) {
            return {
              ...cached,
              name: hq.name,
              address: hq.address,
            };
          }
          return null;
        }

        // Geocode address + city
        try {
          const result = await geocodeAddress(hq.address, hq.city || undefined);
          if (result) {
            const [lat, lng] = result.coords.split(",").map(s => parseFloat(s.trim()));
            const coordResult = { lat, lng };
            geocodeCacheRef.current.set(cacheKey, coordResult);
            return {
              lat,
              lng,
              name: hq.name,
              address: hq.address,
            };
          } else {
            geocodeCacheRef.current.set(cacheKey, null);
          }
        } catch (error) {
          geocodeCacheRef.current.set(cacheKey, null);
        }

        return null;
      });

      const coordinatesResults = await Promise.all(coordinatesPromises);
      const coordinates = coordinatesResults.filter(
        (c): c is { lat: number; lng: number; name: string; address: string } => c !== null
      );


      // Add new markers
      if (coordinates.length > 0) {
        const markerGroup = L.featureGroup();
        coordinates.forEach((coord) => {
          const hq = visibleHeadquarters.find(h => h.name === coord.name);
          const marker = L.marker([coord.lat, coord.lng], {
            icon: createCustomMarkerIcon(hq?.status),
          }).bindPopup(
            `<div class="text-sm"><strong>${coord.name}</strong><br/>${coord.address}</div>`
          );
          
          // Agregar evento click para mostrar información detallada
          marker.on('click', () => {
            if (hq) {
              setSelectedHeadquarter(hq);
            }
          });
          
          markerGroup.addLayer(marker);
        });

        markerGroup.addTo(map);
        markerGroupRef.current = markerGroup;

        // Fit bounds to show all markers
        map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
      } else {
      }
    };

    processHeadquarters();
  }, [headquarters]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return headquarters.filter((hq) => {
      const matchesTerm =
        hq.name.toLowerCase().includes(term) ||
        (hq.address?.toLowerCase() || "").includes(term);
      const matchesStatus = statusFilter === "all" || hq.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [headquarters, search, statusFilter]);

  const stats = useMemo(() => {
    const total = headquarters.length;
    const active = headquarters.filter((h) => h.status === "active").length;
    return { total, active };
  }, [headquarters]);

  // Estadísticas de beneficiarios por sede
  const beneficiariesByHeadquarter = useMemo(() => {
    const statsMap = new Map<string, { total: number; active: number }>();
    
    headquarters.forEach((hq) => {
      const beneficiariesInHQ = beneficiaries.filter(
        (b) => b.headquarters_id === hq.headquarters_id
      );
      const activeBeneficiaries = beneficiariesInHQ.filter(
        (b) => b.status === "activo"
      ).length;
      
      statsMap.set(hq.headquarters_id, {
        total: beneficiariesInHQ.length,
        active: activeBeneficiaries,
      });
    });
    
    return statsMap;
  }, [headquarters, beneficiaries]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setImageFile(null);
    setShowDialog(true);
  };

  const openEdit = (hq: Headquarter) => {
    setEditing(hq);
    setForm({
      name: hq.name,
      status: hq.status,
      address: hq.address || "",
      city: hq.city || "",
      image_url: hq.image_url || null,
    });
    setImageFile(null);
    setShowDialog(true);
  };

  const geocodeAddress = async (address: string, city?: string): Promise<{ coords: string; displayName: string } | null> => {
    try {
      // Combinar dirección y ciudad para mejor precisión
      const fullAddress = city ? `${address}, ${city}` : address;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          coords: `${result.lat}, ${result.lon}`,
          displayName: result.display_name
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Campos requeridos", {
        description: "El nombre es obligatorio",
      });
      return;
    }

    if (!form.address || !form.city) {
      toast.error("Campos requeridos", {
        description: "La dirección y ciudad son obligatorias para ubicar la sede en el mapa",
      });
      return;
    }

    if (!user?.id) {
      toast.error("Error", {
        description: "No se encontró el usuario",
      });
      return;
    }

    try {
      
      let imageUrl = form.image_url;

      if (editing) {
        // Si hay un nuevo archivo de imagen, subirlo
        if (imageFile) {
          imageUrl = await headquarterService.uploadImage(editing.headquarters_id, imageFile);
        }
        
        await headquarterService.update(editing.headquarters_id, {
          ...form,
          image_url: imageUrl,
        });
        toast.success("Sede actualizada", {
          description: `${form.name} guardada correctamente`,
        });
      } else {
        // Crear la sede primero
        const newHeadquarter = await headquarterService.create({
          ...form,
          user_id: user.id,
          image_url: null, // Temporalmente null
        });
        
        // Si hay imagen, subirla y actualizar
        if (imageFile) {
          imageUrl = await headquarterService.uploadImage(newHeadquarter.headquarters_id, imageFile);
          await headquarterService.update(newHeadquarter.headquarters_id, {
            image_url: imageUrl,
          });
        }
        
        toast.success("Sede creada", {
          description: `${form.name} agregada correctamente`,
        });
      }

      setShowDialog(false);
      setEditing(null);
      setImageFile(null);
      void loadHeadquarters(true);
    } catch (error) {
      toast.error("Error al guardar la sede");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await headquarterService.delete(id);
      setDeleteTarget(null);
      toast.success("Sede eliminada", {
        description: "Se ha eliminado la sede",
      });
      void loadHeadquarters(true);
    } catch (error) {
      toast.error("Error al eliminar la sede");
    }
  };

  const toggleStatus = async (id: string, nextStatus: string) => {
    try {
      await headquarterService.update(id, { status: nextStatus });
      void loadHeadquarters(true);
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  return {
    // State
    headquarters,
    loading,
    search,
    statusFilter,
    showDialog,
    editing,
    form,
    deleteTarget,
    filtered,
    stats,
    selectedHeadquarter,
    beneficiariesByHeadquarter,
    
    // Refs
    mapRef,
    
    // Setters
    setSearch,
    setStatusFilter,
    setShowDialog,
    setForm,
    setDeleteTarget,
    setImageFile,
    setSelectedHeadquarter,
    
    // Actions
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    toggleStatus,
  };
};
