"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Cliente } from "@/types/cliente";

interface ClientComboboxProps {
  clientes: Cliente[] | undefined;
  onSelect: (value: string) => void;
}

export function ClientCombobox({ clientes, onSelect }: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? clientes?.find((cliente) => cliente.rut === value)?.razonSocial
            : "Buscar cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandEmpty>No se encontraron clientes.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {clientes?.map((cliente) => (
              <CommandItem
                key={cliente.rut}
                value={cliente.rut}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  onSelect(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === cliente.rut ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{cliente.razonSocial}</span>
                  <span className="text-sm text-muted-foreground">
                    {cliente.rut}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
