// src/components/Header/Header.js

import * as HeaderVariants from './variants';
import { useLocation } from 'react-router-dom';

// 헤더 매핑 정의
const headerMap = [
  { path: '/service/terms/product', component: HeaderVariants.HeaderProduct },
  { path: '/service/check', component: HeaderVariants.HeaderApply },
  { path: '/service/terms', component: HeaderVariants.HeaderTerms },
  { path: '/service', component: HeaderVariants.HeaderApply },
];

export default function Header(props) {
  const { pathname } = useLocation();

  const commonProps = {
    isMainPage: props.isMainPage,
  };

  const MatchedHeader = headerMap.find(
    (entry) => pathname === entry.path
  )?.component;

  return MatchedHeader ? (
    <MatchedHeader {...commonProps} />
  ) : (
    <HeaderVariants.HeaderMain {...commonProps} />
  );
}
