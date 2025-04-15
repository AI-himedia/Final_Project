// components/common/skeletons/SkeletonCard.jsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={styles.card}>
          <Skeleton height={150} style={{ marginBottom: 12 }} />
          <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={16} />
        </div>
      ))}
    </>
  );
}

const styles = {
  card: {
    width: '100%',
    maxWidth: '300px',
    padding: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '24px',
  },
};
