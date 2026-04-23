import { createContext, useContext, useEffect, useState } from "react";

const BasketContext = createContext();

const STORAGE_KEY = "kaffee_kruemel_basket";

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBasket(JSON.parse(saved));
    }
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  }, [basket]);

  // add item
  const addToBasket = (product) => {
    setBasket((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  };

  // remove item
  const removeFromBasket = (id) => {
    setBasket((prev) => prev.filter((item) => item._id !== id));
  };

  // update quantity
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromBasket(id);

    setBasket((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty } : item)),
    );
  };

  const clearBasket = () => {
    setBasket([]);
  };

  return (
    <BasketContext.Provider
      value={{
        basket,
        addToBasket,
        removeFromBasket,
        updateQty,
        clearBasket,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
