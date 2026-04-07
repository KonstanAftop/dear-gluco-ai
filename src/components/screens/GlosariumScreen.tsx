import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface GlossaryItem {
  term: string;
  definition: string;
  category: string;
}

const items: GlossaryItem[] = [
  { term: "HbA1c", definition: "Hemoglobin A1c adalah tes darah yang menunjukkan rata-rata kadar gula darah selama 2-3 bulan terakhir. Target untuk penderita diabetes biasanya di bawah 7%.", category: "Tes Lab" },
  { term: "Hipoglikemia", definition: "Kondisi di mana kadar gula darah turun di bawah 70 mg/dL. Gejala termasuk gemetar, berkeringat, dan kebingungan. Segera konsumsi gula cepat serap.", category: "Kondisi" },
  { term: "Insulin Basal", definition: "Insulin kerja panjang yang diberikan 1-2 kali sehari untuk menjaga kadar gula darah stabil sepanjang hari, bahkan saat tidak makan.", category: "Pengobatan" },
  { term: "Indeks Glikemik", definition: "Skala 0-100 yang mengukur seberapa cepat makanan meningkatkan kadar gula darah. Makanan dengan IG rendah (<55) lebih baik untuk penderita diabetes.", category: "Nutrisi" },
  { term: "Nefropati Diabetik", definition: "Kerusakan ginjal akibat diabetes yang tidak terkontrol. Dapat dicegah dengan kontrol gula darah dan tekanan darah yang baik.", category: "Komplikasi" },
  { term: "Metformin", definition: "Obat diabetes tipe 2 yang paling umum diresepkan. Bekerja dengan mengurangi produksi glukosa oleh hati dan meningkatkan sensitivitas insulin.", category: "Pengobatan" },
];

const GlosariumScreen = () => {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = items.filter(
    (item) =>
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">Glosarium</h2>

      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari istilah medis..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.term} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <span className="font-semibold text-navy text-sm">{item.term}</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-teal-light/20 text-teal font-medium">
                    {item.category}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-teal-light shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-teal-light shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="bg-teal-light/10 rounded-lg p-3">
                    <p className="text-sm text-foreground leading-relaxed">{item.definition}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Tidak ada hasil ditemukan</p>
        )}
      </div>
    </div>
  );
};

export default GlosariumScreen;
