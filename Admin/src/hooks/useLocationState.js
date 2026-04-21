import { useLocation } from 'react-router-dom';
export function useLocationState() {
  const location = useLocation();
  return location.state || {};
}
