import { useState, useMemo, useRef, useEffect } from "react";
import { headquarterService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import L from "leaflet";
import { toast } from "sonner";
import type { Headquarter } from "@/types";

const defaultForm = {
  name: "",
  status: "active",
  address: "",
  city: "",
  image_url: null as string | null,
};

const createCustomMarkerIcon = () => {
  return L.divIcon({
    html: `<svg width='32' height='40' viewBox='0 0 32 40' xmlns='http://www.w3.org/2000/svg' style='filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))'>
      <path d='M16 0C7.73 0 1 6.73 1 15c0 10 15 25 15 25s15-15 15-25c0-8.27-6.73-15-15-15z' fill='#3b82f6' stroke='white' stroke-width='1'/>
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
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Headquarter | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<Headquarter | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.FeatureGroup | null>(null);
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number } | null>>(new Map());

  // Load headquarters
  useEffect(() => {
    loadHeadquarters();
  }, []);

  const loadHeadquarters = async () => {
    try {
      setLoading(true);
      const data = await headquarterService.getAll();
      console.log("Headquarters loaded:", data);
      setHeadquarters(data);
    } catch (error) {
      console.error("Error loading headquarters:", error);
      toast.error("Error al cargar las sedes");
    } finally {
      setLoading(false);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

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
  }, []);

  // Update markers when headquarters change
  useEffect(() => {
    if (!mapInstanceRef.current) {
      console.log("Map instance not ready yet");
      return;
    }

    const map = mapInstanceRef.current;
    console.log("Updating markers for headquarters:", headquarters);

    // Remove existing markers
    if (markerGroupRef.current) {
      map.removeLayer(markerGroupRef.current);
    }

    // Process headquarters and geocode if needed
    const processHeadquarters = async () => {
      const coordinatesPromises = headquarters.map(async (hq) => {
        // Requiere dirección para geocoding
        if (!hq.address) {
          console.log(`Headquarter ${hq.name} has no address`);
          return null;
        }

        // Crear clave de caché combinando dirección y ciudad
        const cacheKey = `${hq.address.toLowerCase()}_${(hq.city || "").toLowerCase()}`;
        
        // Check cache first
        if (geocodeCacheRef.current.has(cacheKey)) {
          const cached = geocodeCacheRef.current.get(cacheKey);
          if (cached) {
            console.log(`Headquarter ${hq.name} using cached coords:`, cached);
            return {
              ...cached,
              name: hq.name,
              address: hq.address,
            };
          }
          return null;
        }

        // Geocode address + city
        console.log(`Geocoding address for ${hq.name}:`, hq.address, hq.city);
        try {
          const result = await geocodeAddress(hq.address, hq.city || undefined);
          if (result) {
            const [lat, lng] = result.coords.split(",").map(s => parseFloat(s.trim()));
            const coordResult = { lat, lng };
            geocodeCacheRef.current.set(cacheKey, coordResult);
            console.log(`Headquarter ${hq.name} geocoded:`, lat, lng, "Location:", result.displayName);
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
          console.error(`Error geocoding ${hq.name}:`, error);
          geocodeCacheRef.current.set(cacheKey, null);
        }

        console.log(`Headquarter ${hq.name} could not be geocoded`);
        return null;
      });

      const coordinatesResults = await Promise.all(coordinatesPromises);
      const coordinates = coordinatesResults.filter(
        (c): c is { lat: number; lng: number; name: string; address: string } => c !== null
      );

      console.log("Valid coordinates found:", coordinates);

      // Add new markers
      if (coordinates.length > 0) {
        const markerGroup = L.featureGroup();
        coordinates.forEach((coord) => {
          console.log("Adding marker at:", coord.lat, coord.lng);
          const marker = L.marker([coord.lat, coord.lng], {
            icon: createCustomMarkerIcon(),
          }).bindPopup(
            `<div class="text-sm"><strong>${coord.name}</strong><br/>${coord.address}</div>`
          );
          markerGroup.addLayer(marker);
        });

        markerGroup.addTo(map);
        markerGroupRef.current = markerGroup;

        // Fit bounds to show all markers
        map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        console.log("Markers added successfully");
      } else {
        console.log("No valid coordinates to display");
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
      console.log("Geocoding full address:", fullAddress);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        console.log("Geocoding result:", result);
        return {
          coords: `${result.lat}, ${result.lon}`,
          displayName: result.display_name
        };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
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
      console.log("Saving headquarter with data:", form);
      
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
      loadHeadquarters();
    } catch (error) {
      console.error("Error saving headquarter:", error);
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
      loadHeadquarters();
    } catch (error) {
      console.error("Error deleting headquarter:", error);
      toast.error("Error al eliminar la sede");
    }
  };

  const toggleStatus = async (id: string, nextStatus: string) => {
    try {
      await headquarterService.update(id, { status: nextStatus });
      loadHeadquarters();
    } catch (error) {
      console.error("Error updating status:", error);
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
    
    // Refs
    mapRef,
    
    // Setters
    setSearch,
    setStatusFilter,
    setShowDialog,
    setForm,
    setDeleteTarget,
    setImageFile,
    
    // Actions
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    toggleStatus,
  };
};
