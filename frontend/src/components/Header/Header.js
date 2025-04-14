// src/components/Header/Header.js

import HeaderMain from '../../layout/Header/HeaderMain';
import HeaderTerms from '../../layout/Header/HeaderTerms';
import HeaderProduct from '../../layout/Header/HeaderProduct';
import { useLocation } from 'react-router-dom';
import HeaderApply from '../../layout/Header/HeaderApply';

export default function Header(props) {
  const { pathname } = useLocation();

  if (pathname === '/service/terms/product') {
    return <HeaderProduct {...props} />;
  }

  if (pathname === '/service/terms') {
    return <HeaderTerms {...props} />;
  }

  if (pathname === '/service') {
    return <HeaderApply {...props} />;
  }

  return <HeaderMain {...props} />;
}
