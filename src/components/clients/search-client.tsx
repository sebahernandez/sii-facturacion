"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Cliente } from "@/types/cliente";

interface SearchClientProps {
  clientes: Cliente[] | null | undefined;
  onSelect: (value: string) => void;
}

export function SearchClient({ clientes, onSelect }: SearchClientProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredClientes = clientes?.filter(
    (cliente) =>
      cliente.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      cliente.rut.toLowerCase().includes(search.toLowerCase())
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
        placeholder="Buscar cliente por nombre o RUT..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && search.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
          {filteredClientes?.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No se encontraron resultados
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {filteredClientes?.map((cliente) => (
                <div
                  key={cliente.rut}
                  className="p-2 hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onSelect(cliente.rut);
                    setSearch(cliente.razonSocial);
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">{cliente.razonSocial}</div>
                  <div className="text-sm text-muted-foreground">
                    {cliente.rut}
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
