import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api";
import OfferList from "./OfferList";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";
import useIsMobile from "../hooks/useIsMobile"; // Import the hook

// --- Lógica de Fetching para React Query ---
const fetchOffers = async ({ queryKey }) => {
  const [, filters, page] = queryKey;
  const params = new URLSearchParams({
    page: page,
    limit: 10,
    ...filters, // Añadimos todos los filtros directamente
  });

  // Limpiamos parámetros vacíos para una URL más limpia
  for (const [key, value] of params.entries()) {
    if (!value) {
      params.delete(key);
    }
  }

  const { data } = await apiClient.get(`offers?${params.toString()}`);
  return data;
};

// --- Componente Principal de la Página de Ofertas ---
function AllOffersPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile(); // Use the hook
  const [showMobileFilters, setShowMobileFilters] = useState(false); // State for mobile filter visibility
  
  // Estado para los filtros (actualización inmediata)
  const [filters, setFilters] = useState({
    puesto: "",
    ubicacion: "",
    nivel: "",
    salarioMin: "",
    salarioMax: "",
    sort: "desc",
  });

  // Estado "debounced" para los filtros que se pasan a la API
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);

  // Efecto para aplicar debounce a los filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1); // Resetear a la página 1 con nuevos filtros
    }, 500); // 500ms de espera

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["offers", debouncedFilters, currentPage],
    queryFn: fetchOffers,
    keepPreviousData: true, // Mantiene los datos anteriores mientras carga los nuevos
  });

  return (
    <div className="all-offers-page">
      <h2>{t("all_offers_title")}</h2>
      
      {/* --- Botón para mostrar/ocultar filtros en móvil --- */}
      {isMobile && (
        <button className="toggle-filters-button" onClick={toggleMobileFilters}>
          {showMobileFilters ? t("hide_filters") : t("show_filters")}
        </button>
      )}

      {/* --- Contenedor de Filtros (condicional en móvil) --- */}
      {(!isMobile || showMobileFilters) && (
        <div className="filters-container">
          <input
            type="text"
            name="puesto"
            placeholder={t("filter_by_position")}
            value={filters.puesto}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="text"
            name="ubicacion"
            placeholder={t("filter_by_location")}
            value={filters.ubicacion}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select name="nivel" value={filters.nivel} onChange={handleFilterChange} className="filter-select">
            <option value="">{t("filter_by_level", "Nivel")}</option>
            <option value="Profesional">{t("level_professional", "Profesional")}</option>
            <option value="Semi-Profesional">{t("level_semi_professional", "Semi-Profesional")}</option>
            <option value="Amateur">{t("level_amateur", "Amateur")}</option>
            <option value="Otro">{t("level_other", "Otro")}</option>
          </select>
          <input
            type="number"
            name="salarioMin"
            placeholder={t("filter_by_min_salary", "Salario Mín.")}
            value={filters.salarioMin}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="number"
            name="salarioMax"
            placeholder={t("filter_by_max_salary", "Salario Máx.")}
            value={filters.salarioMax}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select name="sort" value={filters.sort} onChange={handleFilterChange} className="filter-select">
            <option value="desc">{t("sort_by_recent", "Más recientes")}</option>
            <option value="asc">{t("sort_by_oldest", "Más antiguos")}</option>
          </select>
        </div>
      )}

      {/* --- Contenido de la Página --- */}
      {isLoading ? (
        <LoadingSpinner text={t("loading_offers")} />
      ) : isError ? (
        <p>
          {t("error_loading_offers", "Error loading offers")}: {error.message}
        </p>
      ) : (
        <>
          <OfferList offers={data?.offers || []} showApplyButton={false} />
          <Pagination
            currentPage={currentPage}
            totalPages={data?.totalPages || 0}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default AllOffersPage;