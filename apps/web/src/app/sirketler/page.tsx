'use client';
import GroupedListings from '@/components/GroupedListings';

export default function Page() {
  return (
    <GroupedListings
      type="COMPANY_SALE"
      eyebrow="comp_eb"
      title="comp_t"
      subtitle="comp_s"
      addHref="/paylas?type=COMPANY_SALE"
      addLabel="comp_add"
      payment
      valueLabel="val_total"
    />
  );
}
