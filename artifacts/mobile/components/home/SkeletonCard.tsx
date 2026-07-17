import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';

interface SkeletonCardProps {
  style?: ViewStyle;
  rows?: number;
  rowHeights?: number[];
  padding?: 'sm' | 'md' | 'lg';
}

export function SkeletonCard({
  style,
  rows = 2,
  rowHeights,
  padding = 'md',
}: SkeletonCardProps) {
  const heights = rowHeights ?? Array(rows).fill(16);
  return (
    <Card style={[{ gap: 12 }, style]} padding={padding}>
      {heights.map((h, i) => (
        <Skeleton
          key={i}
          height={h}
          width={i === heights.length - 1 ? '60%' : '100%'}
          borderRadius={8}
        />
      ))}
    </Card>
  );
}
