import React from 'react';
import { Label, Text } from 'react-figma-plugin-ds';
import { arrValue } from '../../plugin/Utils';
import { IconDependency } from './elements/Icons';

export function TableHeader({
  name,
  currentIndex = 0,
  total = 0,
  disabledByProperty = [],
}: {
  name: string;
  currentIndex: number;
  total: number;
  disabledByProperty: string[];
}) {
  return (
    <div className={'flex flex-between gap-1 sticky-exposed-instances-title'}>
      <div className={'w-100'}>
        <Label className={'text--grey-80'}>{`◇ ` + name}</Label>
        {arrValue(disabledByProperty) ? (
          <Text className={'m-0 text--grey-20 pl-xxsmall pb-xxxsmall'}>
            <IconDependency />{' '}
            {disabledByProperty?.map((s) => s.split('#')[0]).join(',')}
          </Text>
        ) : null}
      </div>
      {total > 0 ? (
        <Label className={'justify-content-end'}>
          {currentIndex + ' / ' + total}
        </Label>
      ) : null}
    </div>
  );
}
