"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Producto } from "@/types/producto";

interface SearchProductProps {
  productos: Producto[] | null | undefined;
  onSelect: (producto: Producto) => void;
}

export function SearchProduct({ productos, onSelect }: SearchProductProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredProductos = productos?.filter(
    (producto) =>
      producto.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="search"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && search.length > 0 && (
        <div
          className="fixed z-[999] w-full mt-1 bg-popover border rounded-md shadow-md"
          style={{
            width: wrapperRef.current?.offsetWidth + "px",
            left: wrapperRef.current?.getBoundingClientRect().left + "px",
            top: wrapperRef.current?.getBoundingClientRect().bottom + "px",
          }}
        >
          {filteredProductos?.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No se encontraron resultados
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {filteredProductos?.map((producto) => (
                <div
                  key={producto.id}
                  className="p-2 hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onSelect(producto);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">{producto.descripcion}</div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Código: {producto.codigo}</span>
                    <span>
                      ${producto.precioUnitario.toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
