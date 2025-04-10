// src/components/Header/Header.js

import HeaderMain from '../../layout/Header/HeaderMain';
import HeaderTerms from '../../layout/Header/HeaderTerms';
import HeaderProduct from '../../layout/Header/HeaderProduct';
import { useLocation } from 'react-router-dom';

export default function Header(props) {
  const { pathname } = useLocation();

  if (pathname === '/service/product') {
    return <HeaderProduct {...props} />;
  }

  if (pathname === '/service/terms') {
    return <HeaderTerms {...props} />;
  }

  return <HeaderMain {...props} />;
}
