import { SectionScreen } from '@/components/section-screen';
import { AAVIE_SECTIONS } from '@/constants/modules';

export default function AccueilScreen() {
  return <SectionScreen section={AAVIE_SECTIONS[0]} showAppTitle />;
}
