import React from 'react';
import { Label } from 'react-figma-plugin-ds';

export function TableHeader({
  name,
  currentIndex = 0,
  total = 0,
}: {
  name: string;
  currentIndex: number;
  total: number;
}) {
  return (
    <div className={'flex flex-between gap-1 sticky-exposed-instances-title'}>
      <Label className={'text--grey-80'}>{`◇ ` + name}</Label>
      {total > 0 ? (
        <Label className={'justify-content-end'}>
          {currentIndex + ' / ' + total}
        </Label>
      ) : null}
    </div>
  );
}
