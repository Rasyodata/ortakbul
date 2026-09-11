'use client';
import GroupedListings from '@/components/GroupedListings';

export default function Page() {
  return (
    <GroupedListings
      type="FRANCHISE"
      eyebrow="fr_eb"
      title="fr_t"
      subtitle="fr_s"
      addHref="/paylas?type=FRANCHISE"
      addLabel="fr_add"
      valueLabel="val_invest"
    />
  );
}
