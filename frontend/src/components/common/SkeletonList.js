// components/common/SkeletonList.js
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonList({
  count = 3,
  width = 200,
  height = 20,
  style = {},
}) {
  return (
    <ul>
      {[...Array(count)].map((_, i) => (
        <li key={i}>
          <Skeleton
            width={width}
            height={height}
            style={{ marginBottom: 10, ...style }}
          />
        </li>
      ))}
    </ul>
  );
}
