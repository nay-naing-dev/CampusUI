import { Redirect } from 'expo-router';

/**
 * Placeholder so the tab bar keeps its raised Sell slot. The button opens the
 * full /sell-item page instead; anything that lands here is sent there too.
 */
export default function SellTab() {
  return <Redirect href="/sell-item" />;
}
