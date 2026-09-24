import React from 'react';
import { X, Check, Utensils, Flame, Scissors, Sparkles, ChefHat } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Dengarkan Pesanan Pelanggan',
      desc: 'Setiap pelanggan memiliki selera unik! Perhatikan dialog dan catatan tiket resep untuk mengetahui topping, potongan, dan larangan bahan.',
      icon: <ChefHat className="w-5 h-5 text-amber-400" />,
    },
    {
      num: '2',
      title: 'Bahan Dasar: Saus & Keju',
      desc: 'Oleskan saus tomat kaya rempah dan taburkan keju mozzarella gurih ke atas adonan (kecuali jika pelanggan meminta tanpa saus/keju).',
      icon: <Utensils className="w-5 h-5 text-rose-400" />,
    },
    {
      num: '3',
      title: 'Pilih & Tata Topping',
      desc: 'Pilih Pepperoni, Jamur, Sosis, Bawang, atau Paprika. Klik langsung pada pizza untuk meletakkan topping, atau gunakan tombol cepat "+ Tabur 7x".',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
    },
    {
      num: '4',
      title: 'Panggang di Oven',
      desc: 'Masukkan pizza ke oven. Perhatikan indikator hingga bar mencapai zona hijau "Matang Sempurna!". Awas, jangan dibiarkan sampai gosong!',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
    {
      num: '5',
      title: 'Potong & Sajikan',
      desc: 'Potong pizza menjadi 4 atau 6 slice sesuai permintaan. Lalu tekan "Sajikan Pizza ke Pelanggan" untuk menerima uang dan tips!',
      icon: <Scissors className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-amber-950 border-2 border-amber-700 rounded-3xl p-6 shadow-2xl text-amber-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <h3 className="text-xl font-bold text-amber-200 font-display">
              Cara Bermain "Good Pizza"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="py-4 space-y-3 overflow-y-auto pr-1">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-900/40 border border-amber-800/60"
            >
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 shrink-0">
                {step.icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-amber-400">Langkah {step.num}:</span>
                  <h4 className="text-sm font-bold text-amber-100">{step.title}</h4>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Target condition note */}
        <div className="p-3 bg-amber-900/60 rounded-xl border border-amber-800/80 text-xs text-amber-200 mb-4 text-left">
          <strong className="text-amber-300">Aturan Menang & Kalah:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200/90">
            <li>Menang jika menyelesaikan target pesanan harian.</li>
            <li>Kalah jika mendapat 3 teguran karena pesanan salah/kecewa.</li>
          </ul>
        </div>

        {/* Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
        >
          Saya Siap Memasak! (Mengerti)
        </button>
      </div>
    </div>
  );
};
