// src/components/Header/Header.js
// RouteMeta.js 에 showHeader: true 설정이 되어야 매핑이 됩니다.

import * as HeaderVariants from './variants';
import { useLocation } from 'react-router-dom';

// 헤더 매핑 정의
const headerMap = [
  { path: '/service/terms/product', component: HeaderVariants.HeaderProduct },
  { path: '/service/terms/check', component: HeaderVariants.HeaderCheck },
  { path: '/sms/chat', component: HeaderVariants.HeaderService },
  { path: '/service/terms', component: HeaderVariants.HeaderTerms },
  { path: '/service', component: HeaderVariants.HeaderApply },
  { path: '/deceased/profile/step1', component: HeaderVariants.HeaderDeceased },
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
