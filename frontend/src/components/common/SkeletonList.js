import CardSkeleton from './skeletons/SkeletonCard';

export default function SkeletonList({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </>
  );
}
