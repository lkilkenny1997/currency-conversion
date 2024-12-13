import { Card, CardContent, CardHeader } from './ui/card';

export const SkeletonCurrencyConverter = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
          <div className="h-9 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-9 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
};
