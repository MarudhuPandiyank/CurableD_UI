import { useSelector } from 'react-redux';
import { hasPrivilege, Privilege } from '../store/userSlice';

export default function usePrivilege(menuOrUrl: string, need: Privilege | Privilege[]) {
  return useSelector(hasPrivilege(menuOrUrl, need));
}
