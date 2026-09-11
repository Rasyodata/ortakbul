'use client';
import GroupedListings from '@/components/GroupedListings';

export default function Page() {
  return (
    <GroupedListings
      type="PARTNERSHIP"
      eyebrow="seekers_eb"
      title="seekers_t"
      subtitle="seekers_s"
      addHref="/paylas?type=PARTNERSHIP"
      addLabel="seekers_add"
      valueLabel="val_demand"
    />
  );
}
