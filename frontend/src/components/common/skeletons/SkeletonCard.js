import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function CardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        padding: '1rem',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <Skeleton circle width={48} height={48} />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}
