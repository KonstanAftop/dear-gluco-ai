import { useState } from "react";
import BottomNav, { type Tab } from "@/components/BottomNav";
import Header from "@/components/Header";
import BerandaScreen from "@/components/screens/BerandaScreen";
import RiwayatScreen from "@/components/screens/RiwayatScreen";
import PengingatScreen from "@/components/screens/PengingatScreen";
import GlosariumScreen from "@/components/screens/GlosariumScreen";
import RecordingFlow from "@/components/recording/RecordingFlow";

const screens: Record<Tab, React.ComponentType<{ onStartRecording?: (doctor: string) => void }>> = {
  beranda: BerandaScreen,
  riwayat: RiwayatScreen,
  pengingat: PengingatScreen,
  glosarium: GlosariumScreen,
};

const Index = () => {
  const [tab, setTab] = useState<Tab>("beranda");
  const [recordingDoctor, setRecordingDoctor] = useState<string | null>(null);
  const Screen = screens[tab];

  if (recordingDoctor) {
    return (
      <RecordingFlow
        doctorName={recordingDoctor}
        onClose={() => setRecordingDoctor(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] flex flex-col">
        {!recordingDoctor && <Header />}
        <div className="flex-1 px-4 pt-4 pb-24">
          <Screen onStartRecording={(doctor) => setRecordingDoctor(doctor)} />
        </div>
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
