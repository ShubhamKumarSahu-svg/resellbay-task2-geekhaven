import { useCallback, useEffect, useRef, useState } from 'react';

export function useDropdownMenu(initialIsOpen = false) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const menuRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return { menuRef, isOpen, setIsOpen, toggleMenu };
}
