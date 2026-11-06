import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const SucursalContext = createContext(null);
const STORAGE_KEY = "frulex_sucursal_id";

function readStoredId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  } catch {
    return null;
  }
}

export function SucursalProvider({ children }) {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sucursalId, setSucursalId] = useState(readStoredId);
  const [ofertas, setOfertas] = useState([]);
  const [ofertasLoading, setOfertasLoading] = useState(false);

  // CU-04: sucursales disponibles
  useEffect(() => {
    let active = true;
    api
      .get("/sucursales/")
      .then(({ data }) => {
        if (!active) return;
        setSucursales(data);
        // Si la sucursal guardada ya no existe o fue desactivada, se descarta.
        setSucursalId((current) =>
          current && !data.some((sucursal) => sucursal.id === current) ? null : current,
        );
      })
      .catch(() => {
        if (active) setSucursales([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sucursalActiva = useMemo(
    () => sucursales.find((sucursal) => sucursal.id === sucursalId) || null,
    [sucursales, sucursalId],
  );
  const activeId = sucursalActiva?.id ?? null;

  useEffect(() => {
    try {
      if (sucursalId) localStorage.setItem(STORAGE_KEY, String(sucursalId));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [sucursalId]);

  // CU-05: ofertas de la sucursal activa
  useEffect(() => {
    if (!activeId) {
      setOfertas([]);
      setOfertasLoading(false);
      return undefined;
    }
    let active = true;
    setOfertasLoading(true);
    api
      .get(`/productos/ofertas/${activeId}`)
      .then(({ data }) => {
        if (active) {
          setOfertas(
            data.map((oferta) => ({
              ...oferta,
              precio_original: Number(oferta.precio_original),
              precio_oferta: Number(oferta.precio_oferta),
            })),
          );
        }
      })
      .catch(() => {
        if (active) setOfertas([]);
      })
      .finally(() => {
        if (active) setOfertasLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeId]);

  const ofertasPorProducto = useMemo(
    () => Object.fromEntries(ofertas.map((oferta) => [oferta.id, oferta])),
    [ofertas],
  );

  const seleccionarSucursal = (id) => {
    const parsed = Number(id);
    setSucursalId(parsed > 0 ? parsed : null);
  };

  const value = useMemo(
    () => ({
      sucursales,
      loading,
      sucursalActiva,
      seleccionarSucursal,
      ofertas,
      ofertasLoading,
      ofertasPorProducto,
    }),
    [sucursales, loading, sucursalActiva, ofertas, ofertasLoading, ofertasPorProducto],
  );

  return <SucursalContext.Provider value={value}>{children}</SucursalContext.Provider>;
}

export function useSucursal() {
  return useContext(SucursalContext);
}
