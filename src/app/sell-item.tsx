import { useLocalSearchParams } from 'expo-router';
import { SellScreen } from '@/components/SellScreen';

/**
 * The same sell form as a full page, opened from Settings and My listings.
 * With `?id=` it edits that listing: photos, title, price and the rest.
 */
export default function SellItemRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <SellScreen presentation="page" editId={id} />;
}
