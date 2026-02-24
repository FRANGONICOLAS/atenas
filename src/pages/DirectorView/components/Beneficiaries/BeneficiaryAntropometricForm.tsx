import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Json } from "@/api/types";
import type { AntropometricData } from "@/types/beneficiary.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ExtendedAntropometricData extends AntropometricData {
  [key: string]: Json;
}

interface BeneficiaryAntropometricFormProps {
  data?: Json;
  onChange: (data: Json) => void;
}

// Función para validar rangos
const validateRange = (value: number | undefined, min: number, max: number): "success" | "error" | "default" => {
  if (!value) return "default";
  return value >= min && value <= max ? "success" : "error";
};

// Componente de Input con validación de rango
const RangedInput = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  unit,
  placeholder,
  step = "0.1",
}: {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  min: number;
  max: number;
  unit: string;
  placeholder?: string;
  step?: string;
}) => {
  const status = validateRange(value, min, max);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        {value && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-1",
            status === "success" && "text-green-600",
            status === "error" && "text-red-600"
          )}>
            {status === "error" && <AlertCircle className="w-3 h-3" />}
            {min}-{max} {unit}
          </span>
        )}
      </div>
      <Input
        id={id}
        type="number"
        step={step}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder || `${min}-${max}`}
        className={cn(
          status === "success" && "border-green-500 focus-visible:ring-green-500",
          status === "error" && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
  );
};

export const BeneficiaryAntropometricForm = ({
  data,
  onChange,
}: BeneficiaryAntropometricFormProps) => {
  const antropometricData = (data as ExtendedAntropometricData) || {};
  const genero = antropometricData.genero || "hombre";

  const handleChange = (field: string, value: Json) => {
    const newData = {
      ...antropometricData,
      [field]: value,
    };
    
    // Calcular IMC automáticamente
    if (field === "peso" || field === "talla") {
      if (newData.peso && newData.talla) {
        newData.imc = parseFloat((newData.peso / Math.pow(newData.talla / 100, 2)).toFixed(2));
      }
    }
    
    // Calcular relación cintura-cadera automáticamente
    if (field === "perimetro_cintura" || field === "perimetro_cadera") {
      if (newData.perimetro_cintura && newData.perimetro_cadera) {
        newData.relacion_cintura_cadera = parseFloat((newData.perimetro_cintura / newData.perimetro_cadera).toFixed(2));
      }
    }
    
    onChange(newData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Evaluación Antropométrica Completa
        </CardTitle>
        <CardDescription>
          Completa las mediciones físicas del beneficiario. Los valores fuera de rango se marcarán en rojo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Género */}
        <div className="space-y-2">
          <Label htmlFor="genero">Género del Beneficiario *</Label>
          <Select
            value={genero}
            onValueChange={(value: "hombre" | "mujer") => handleChange("genero", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hombre">Hombre</SelectItem>
              <SelectItem value="mujer">Mujer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* MEDIDAS ANTROPOMÉTRICAS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Medidas Antropométricas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={antropometricData.peso || ""}
                onChange={(e) => handleChange("peso", parseFloat(e.target.value) || 0)}
                placeholder="Ej: 45.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="talla">Talla (cm)</Label>
              <Input
                id="talla"
                type="number"
                step="0.1"
                value={antropometricData.talla || ""}
                onChange={(e) => handleChange("talla", parseFloat(e.target.value) || 0)}
                placeholder="Ej: 165"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imc">IMC (kg/m²)</Label>
              <Input
                id="imc"
                type="number"
                step="0.01"
                value={antropometricData.imc || ""}
                placeholder="Calculado automáticamente"
                disabled
                className="bg-muted"
              />
            </div>
            
            <RangedInput
              id="perimetro_cintura"
              label="Perímetro Cintura"
              value={antropometricData.perimetro_cintura}
              onChange={(val) => handleChange("perimetro_cintura", val)}
              min={genero === "hombre" ? 70 : 65}
              max={genero === "hombre" ? 90 : 80}
              unit="cm"
            />
            
            <RangedInput
              id="perimetro_cadera"
              label="Perímetro Cadera"
              value={antropometricData.perimetro_cadera}
              onChange={(val) => handleChange("perimetro_cadera", val)}
              min={genero === "hombre" ? 85 : 90}
              max={genero === "hombre" ? 105 : 110}
              unit="cm"
            />
            
            <div className="space-y-2">
              <Label htmlFor="relacion_cintura_cadera">Relación Cintura/Cadera</Label>
              <Input
                id="relacion_cintura_cadera"
                type="number"
                step="0.01"
                value={antropometricData.relacion_cintura_cadera || ""}
                placeholder="Calculado automáticamente"
                disabled
                className="bg-muted"
              />
            </div>
            
            <RangedInput
              id="perimetro_brazo"
              label="Perímetro Brazo Relajado"
              value={antropometricData.perimetro_brazo}
              onChange={(val) => handleChange("perimetro_brazo", val)}
              min={genero === "hombre" ? 25 : 22}
              max={genero === "hombre" ? 35 : 30}
              unit="cm"
            />
            
            <RangedInput
              id="perimetro_muslo"
              label="Perímetro Muslo"
              value={antropometricData.perimetro_muslo}
              onChange={(val) => handleChange("perimetro_muslo", val)}
              min={genero === "hombre" ? 45 : 42}
              max={genero === "hombre" ? 60 : 55}
              unit="cm"
            />
            
            <RangedInput
              id="perimetro_pantorrilla"
              label="Perímetro Pantorrilla"
              value={antropometricData.perimetro_pantorrilla}
              onChange={(val) => handleChange("perimetro_pantorrilla", val)}
              min={genero === "hombre" ? 32 : 30}
              max={genero === "hombre" ? 42 : 38}
              unit="cm"
            />
          </div>
        </div>

        {/* PLIEGUES CUTÁNEOS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Pliegues Cutáneos</h3>
          <div className="grid grid-cols-2 gap-4">
            <RangedInput
              id="pliegue_tricipital"
              label="Tricipital"
              value={antropometricData.pliegue_tricipital}
              onChange={(val) => handleChange("pliegue_tricipital", val)}
              min={genero === "hombre" ? 6 : 12}
              max={genero === "hombre" ? 12 : 20}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_bicipital"
              label="Bicipital"
              value={antropometricData.pliegue_bicipital}
              onChange={(val) => handleChange("pliegue_bicipital", val)}
              min={genero === "hombre" ? 3 : 5}
              max={genero === "hombre" ? 8 : 12}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_subescapular"
              label="Subescapular"
              value={antropometricData.pliegue_subescapular}
              onChange={(val) => handleChange("pliegue_subescapular", val)}
              min={genero === "hombre" ? 8 : 10}
              max={genero === "hombre" ? 18 : 22}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_suprailiaco"
              label="Suprailiaco"
              value={antropometricData.pliegue_suprailiaco}
              onChange={(val) => handleChange("pliegue_suprailiaco", val)}
              min={genero === "hombre" ? 6 : 10}
              max={genero === "hombre" ? 15 : 20}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_abdominal"
              label="Abdominal"
              value={antropometricData.pliegue_abdominal}
              onChange={(val) => handleChange("pliegue_abdominal", val)}
              min={genero === "hombre" ? 10 : 15}
              max={genero === "hombre" ? 25 : 30}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_muslo"
              label="Muslo"
              value={antropometricData.pliegue_muslo}
              onChange={(val) => handleChange("pliegue_muslo", val)}
              min={genero === "hombre" ? 8 : 10}
              max={genero === "hombre" ? 18 : 25}
              unit="mm"
            />
            
            <RangedInput
              id="pliegue_pantorrilla"
              label="Pantorrilla"
              value={antropometricData.pliegue_pantorrilla}
              onChange={(val) => handleChange("pliegue_pantorrilla", val)}
              min={genero === "hombre" ? 6 : 8}
              max={genero === "hombre" ? 12 : 20}
              unit="mm"
            />
          </div>
        </div>

        {/* DIÁMETROS ÓSEOS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Diámetros Óseos</h3>
          <div className="grid grid-cols-2 gap-4">
            <RangedInput
              id="biacromial"
              label="Biacromial"
              value={antropometricData.biacromial}
              onChange={(val) => handleChange("biacromial", val)}
              min={genero === "hombre" ? 37 : 32}
              max={genero === "hombre" ? 42 : 37}
              unit="cm"
            />
            
            <RangedInput
              id="bicrestal"
              label="Bicrestal"
              value={antropometricData.bicrestal}
              onChange={(val) => handleChange("bicrestal", val)}
              min={genero === "hombre" ? 28 : 26}
              max={genero === "hombre" ? 32 : 30}
              unit="cm"
            />
            
            <RangedInput
              id="biepicondilar_humero"
              label="Biepicondilar Húmero"
              value={antropometricData.biepicondilar_humero}
              onChange={(val) => handleChange("biepicondilar_humero", val)}
              min={genero === "hombre" ? 6 : 5}
              max={genero === "hombre" ? 8 : 7}
              unit="cm"
            />
            
            <RangedInput
              id="biepicondilar_femur"
              label="Biepicondilar Fémur"
              value={antropometricData.biepicondilar_femur}
              onChange={(val) => handleChange("biepicondilar_femur", val)}
              min={genero === "hombre" ? 8 : 7}
              max={genero === "hombre" ? 11 : 10}
              unit="cm"
            />
            
            <RangedInput
              id="biestiloideo_muneca"
              label="Biestiloideo Muñeca"
              value={antropometricData.biestiloideo_muneca}
              onChange={(val) => handleChange("biestiloideo_muneca", val)}
              min={genero === "hombre" ? 4.5 : 4}
              max={genero === "hombre" ? 5 : 5.5}
              unit="cm"
            />
            
            <RangedInput
              id="bitrocantereo"
              label="Bitrocantéreo"
              value={antropometricData.bitrocantereo}
              onChange={(val) => handleChange("bitrocantereo", val)}
              min={genero === "hombre" ? 30 : 28}
              max={genero === "hombre" ? 38 : 36}
              unit="cm"
            />
          </div>
        </div>

        {/* COMPOSICIÓN CORPORAL */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Composición Corporal Estimada</h3>
          <div className="grid grid-cols-2 gap-4">
            <RangedInput
              id="porcentaje_grasa"
              label="Porcentaje de Grasa Corporal"
              value={antropometricData.porcentaje_grasa}
              onChange={(val) => handleChange("porcentaje_grasa", val)}
              min={genero === "hombre" ? 10 : 20}
              max={genero === "hombre" ? 20 : 30}
              unit="%"
            />
            
            <RangedInput
              id="masa_magra"
              label="Masa Magra"
              value={antropometricData.masa_magra}
              onChange={(val) => handleChange("masa_magra", val)}
              min={genero === "hombre" ? 76 : 69}
              max={genero === "hombre" ? 82 : 75}
              unit="%"
            />
            
            <RangedInput
              id="masa_osea"
              label="Masa Ósea Estimada"
              value={antropometricData.masa_osea}
              onChange={(val) => handleChange("masa_osea", val)}
              min={12}
              max={15}
              unit="% del peso"
            />
          </div>
        </div>

        {/* SOMATOTIPO */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Evaluación del Somatotipo</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endomorfina">Endomorfina</Label>
              <Input
                id="endomorfina"
                type="number"
                step="0.1"
                value={antropometricData.endomorfina || ""}
                onChange={(e) => handleChange("endomorfina", parseFloat(e.target.value) || 0)}
                placeholder="0.0 - 10.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mesomorfina">Mesomorfina</Label>
              <Input
                id="mesomorfina"
                type="number"
                step="0.1"
                value={antropometricData.mesomorfina || ""}
                onChange={(e) => handleChange("mesomorfina", parseFloat(e.target.value) || 0)}
                placeholder="0.0 - 10.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ectomorfina">Ectomorfina</Label>
              <Input
                id="ectomorfina"
                type="number"
                step="0.1"
                value={antropometricData.ectomorfina || ""}
                onChange={(e) => handleChange("ectomorfina", parseFloat(e.target.value) || 0)}
                placeholder="0.0 - 10.0"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Nota:</strong> Los campos con bordes verdes están dentro del rango saludable. 
            Los campos con bordes rojos indican valores fuera del rango esperado para el género seleccionado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
