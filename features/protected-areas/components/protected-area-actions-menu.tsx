"use client";

import { useRouter } from "next/navigation";
import {
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownRoot,
  DropdownTrigger,
} from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Medal,
  MessageCircle,
  Mic,
  SquarePen,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface ProtectedAreaActionsMenuProps {
  areaId: string;
}

/**
 * Antes había 4-6 botones (FlashCards, Speaking, Chatbot, Test, Editar,
 * Publicar/Despublicar) amontonados en una sola fila de la card. Este menú
 * agrupa la gestión de contenido (todo lo que es simple navegación, sin
 * confirmaciones) en un único botón "Gestionar" — Publicar/Despublicar se
 * queda fuera, visible en la card, porque abre su propio diálogo de
 * confirmación (ver UnpublishAreaButton) y no conviene anidarlo dentro de un
 * ítem de menú.
 */
export function ProtectedAreaActionsMenu({
  areaId,
}: ProtectedAreaActionsMenuProps) {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();

  const items = [
    {
      key: "flash-cards",
      label: "FlashCards",
      icon: BookOpen,
      href: `/teacher/protected-areas/${areaId}/flash-cards`,
    },
    {
      key: "speaking-practice",
      label: "Speaking",
      icon: Mic,
      href: `/teacher/protected-areas/${areaId}/speaking-practice`,
    },
    {
      key: "chatbot",
      label: "Chatbot",
      icon: MessageCircle,
      href: `/teacher/protected-areas/${areaId}/chatbot`,
    },
    {
      key: "test",
      label: language === "en" ? "Test" : "Examen",
      icon: ClipboardCheck,
      href: `/teacher/protected-areas/${areaId}/test`,
    },
    {
      key: "badges",
      label: language === "en" ? "Badges" : "Insignias",
      icon: Medal,
      href: `/teacher/protected-areas/${areaId}/badges`,
    },
    {
      key: "edit",
      label: language === "en" ? "Edit" : "Editar",
      icon: SquarePen,
      href: `/teacher/protected-areas/${areaId}/edit`,
    },
  ] as const;

  return (
    <DropdownRoot>
      {/* DropdownTrigger ya renderiza un <button> (mismo primitivo de
          react-aria-components que usa el Button de HeroUI), así que en vez
          de anidar otro <Button> adentro (HTML inválido: <button><button>),
          le aplicamos directamente las clases visuales de buttonVariants.
          El CSS de "dropdown__trigger" trae `display: inline-block`, que le
          gana en cascada al `inline-flex` del propio botón y hace que el
          ícono se vaya a otra línea — se fuerza con `!` para que el texto y
          el chevron queden alineados en una sola fila. */}
      <DropdownTrigger
        className={`${buttonVariants({ variant: "outline", size: "sm" })} !inline-flex !items-center gap-1.5`}
      >
        {language === "en" ? "Manage" : "Gestionar"}
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </DropdownTrigger>
      <DropdownPopover placement="bottom start">
        <DropdownMenu
          aria-label={language === "en" ? "Area actions" : "Acciones del área"}
          onAction={(key) => {
            const item = items.find((entry) => entry.key === key);
            if (item) router.push(item.href);
          }}
        >
          {items.map((item) => (
            <DropdownItem
              key={item.key}
              id={item.key}
              textValue={item.label}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4 text-muted" aria-hidden="true" />
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </DropdownRoot>
  );
}
