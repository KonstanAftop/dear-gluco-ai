/**
 * Pre-Consultation Form for DearGluco.ai
 *
 * This component collects patient information before starting the AI consultation,
 * including glucose levels, symptoms, and urgency assessment.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Activity, AlertTriangle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDiabetesConsultation } from '../../hooks/useDiabetesConsultation';

interface PreConsultationFormProps {
  onStart: (participantName: string) => Promise<void>;
  onCancel: () => void;
  isStarting: boolean;
}

const COMMON_SYMPTOMS = [
  'Haus berlebihan',
  'Sering buang air kecil',
  'Lapar terus menerus',
  'Kelelahan',
  'Penglihatan buram',
  'Luka lambat sembuh',
  'Kesemutan',
  'Pusing',
  'Mual',
  'Berat badan turun',
];

const COMMON_MEDICATIONS = [
  'Metformin',
  'Glimepiride',
  'Insulin',
  'Glibenclamide',
  'Acarbose',
  'Sitagliptin',
  'Empagliflozin',
  'Pioglitazone',
];

export default function PreConsultationForm({
  onStart,
  onCancel,
  isStarting
}: PreConsultationFormProps) {
  const {
    preConsultationData,
    updatePreConsultationData,
    isPreConsultationComplete,
  } = useDiabetesConsultation();

  const [participantName, setParticipantName] = useState('');
  const [glucoseInput, setGlucoseInput] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [customMedication, setCustomMedication] = useState('');
  const [lastMealHours, setLastMealHours] = useState('');

  // Handle glucose level input
  const handleGlucoseChange = (value: string) => {
    setGlucoseInput(value);
    const glucose = parseInt(value);
    if (!isNaN(glucose) && glucose > 0) {
      updatePreConsultationData({ glucoseLevel: glucose });

      // Auto-detect urgency based on glucose level
      if (glucose < 70 || glucose > 300) {
        updatePreConsultationData({ urgencyLevel: 'emergency' });
      } else if (glucose < 80 || glucose > 250) {
        updatePreConsultationData({ urgencyLevel: 'urgent' });
      } else {
        updatePreConsultationData({ urgencyLevel: 'normal' });
      }
    }
  };

  // Handle symptom selection
  const toggleSymptom = (symptom: string) => {
    const currentSymptoms = preConsultationData.symptoms;
    const updatedSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];

    updatePreConsultationData({ symptoms: updatedSymptoms });
  };

  // Add custom symptom
  const addCustomSymptom = () => {
    if (customSymptom.trim() && !preConsultationData.symptoms.includes(customSymptom.trim())) {
      updatePreConsultationData({
        symptoms: [...preConsultationData.symptoms, customSymptom.trim()]
      });
      setCustomSymptom('');
    }
  };

  // Handle medication selection
  const toggleMedication = (medication: string) => {
    const currentMedications = preConsultationData.medications;
    const updatedMedications = currentMedications.includes(medication)
      ? currentMedications.filter(m => m !== medication)
      : [...currentMedications, medication];

    updatePreConsultationData({ medications: updatedMedications });
  };

  // Add custom medication
  const addCustomMedication = () => {
    if (customMedication.trim() && !preConsultationData.medications.includes(customMedication.trim())) {
      updatePreConsultationData({
        medications: [...preConsultationData.medications, customMedication.trim()]
      });
      setCustomMedication('');
    }
  };

  // Handle last meal time
  const handleLastMealChange = (hours: string) => {
    setLastMealHours(hours);
    const hoursNum = parseInt(hours);
    if (!isNaN(hoursNum) && hoursNum >= 0) {
      const mealTime = new Date();
      mealTime.setHours(mealTime.getHours() - hoursNum);
      updatePreConsultationData({ lastMealTime: mealTime });
    }
  };

  // Handle urgency level selection
  const handleUrgencyChange = (level: 'normal' | 'urgent' | 'emergency') => {
    updatePreConsultationData({ urgencyLevel: level });
  };

  // Handle notes
  const handleNotesChange = (notes: string) => {
    updatePreConsultationData({ notes });
  };

  // Start consultation
  const handleStart = async () => {
    if (!participantName.trim()) {
      return;
    }
    await onStart(participantName.trim());
  };

  // Determine if we can start consultation
  const canStart = participantName.trim() && (
    preConsultationData.symptoms.length > 0 ||
    preConsultationData.glucoseLevel ||
    preConsultationData.urgencyLevel === 'emergency'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40">
      <div className="w-full max-w-[440px] bg-card rounded-t-3xl animate-slide-up flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="gradient-hero rounded-t-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-primary-foreground font-bold text-lg">Persiapan Konsultasi</h3>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Participant Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Anda *</Label>
            <Input
              id="name"
              placeholder="Masukkan nama Anda"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
          </div>

          {/* Glucose Level */}
          <div className="space-y-2">
            <Label htmlFor="glucose">Kadar Gula Darah Saat Ini (mg/dL)</Label>
            <Input
              id="glucose"
              type="number"
              placeholder="Contoh: 120"
              value={glucoseInput}
              onChange={(e) => handleGlucoseChange(e.target.value)}
            />
            {preConsultationData.glucoseLevel && (
              <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                preConsultationData.urgencyLevel === 'emergency'
                  ? 'bg-red-100 text-red-700'
                  : preConsultationData.urgencyLevel === 'urgent'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {preConsultationData.urgencyLevel === 'emergency' && '⚠️ Level Darurat'}
                {preConsultationData.urgencyLevel === 'urgent' && '⚡ Perlu Perhatian'}
                {preConsultationData.urgencyLevel === 'normal' && '✅ Level Normal'}
              </div>
            )}
          </div>

          {/* Last Meal */}
          <div className="space-y-2">
            <Label htmlFor="lastMeal">Makan Terakhir (jam yang lalu)</Label>
            <Input
              id="lastMeal"
              type="number"
              placeholder="Contoh: 2"
              value={lastMealHours}
              onChange={(e) => handleLastMealChange(e.target.value)}
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label>Gejala yang Anda Rasakan</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`text-xs p-2 rounded-lg border text-left transition-colors ${
                    preConsultationData.symptoms.includes(symptom)
                      ? 'bg-teal-light border-teal text-accent-foreground'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>

            {/* Custom symptom input */}
            <div className="flex gap-2">
              <Input
                placeholder="Gejala lain..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addCustomSymptom}
                disabled={!customSymptom.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected symptoms */}
            {preConsultationData.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preConsultationData.symptoms.map((symptom) => (
                  <div
                    key={symptom}
                    className="flex items-center gap-1 bg-teal-light text-accent-foreground px-2 py-1 rounded-full text-xs"
                  >
                    {symptom}
                    <button
                      onClick={() => toggleSymptom(symptom)}
                      className="hover:bg-teal/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="space-y-3">
            <Label>Obat yang Sedang Dikonsumsi</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_MEDICATIONS.map((medication) => (
                <button
                  key={medication}
                  onClick={() => toggleMedication(medication)}
                  className={`text-xs p-2 rounded-lg border text-left transition-colors ${
                    preConsultationData.medications.includes(medication)
                      ? 'bg-teal-light border-teal text-accent-foreground'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  {medication}
                </button>
              ))}
            </div>

            {/* Custom medication input */}
            <div className="flex gap-2">
              <Input
                placeholder="Obat lain..."
                value={customMedication}
                onChange={(e) => setCustomMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomMedication()}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addCustomMedication}
                disabled={!customMedication.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected medications */}
            {preConsultationData.medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preConsultationData.medications.map((medication) => (
                  <div
                    key={medication}
                    className="flex items-center gap-1 bg-teal-light text-accent-foreground px-2 py-1 rounded-full text-xs"
                  >
                    {medication}
                    <button
                      onClick={() => toggleMedication(medication)}
                      className="hover:bg-teal/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <Label>Tingkat Urgensi</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { level: 'normal' as const, label: 'Normal - Konsultasi Rutin', color: 'bg-green-50 border-green-200 text-green-700' },
                { level: 'urgent' as const, label: 'Mendesak - Butuh Perhatian Segera', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { level: 'emergency' as const, label: 'Darurat - Kondisi Kritis', color: 'bg-red-50 border-red-200 text-red-700' },
              ].map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => handleUrgencyChange(level)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    preConsultationData.urgencyLevel === level
                      ? color + ' ring-2 ring-offset-2 ring-current'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              placeholder="Informasi tambahan yang ingin Anda sampaikan..."
              value={preConsultationData.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Warning for emergency */}
          {preConsultationData.urgencyLevel === 'emergency' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-700 text-sm">
                <p className="font-medium">Kondisi Darurat Terdeteksi</p>
                <p>Jika ini adalah kondisi darurat medis, segera hubungi 119 atau pergi ke UGD terdekat.</p>
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            onClick={handleStart}
            disabled={!canStart || isStarting}
            className="w-full"
            size="lg"
          >
            {isStarting ? (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-spin" />
                Menghubungkan...
              </div>
            ) : (
              'Mulai Konsultasi AI'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Konsultasi AI ini tidak menggantikan saran medis profesional
          </p>
        </div>
      </div>
    </div>
  );
}