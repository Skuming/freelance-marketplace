"use client";

import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  MessageSquareText,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Заказы",
    icon: BriefcaseBusiness,
  },
  {
    href: "/chats",
    label: "Чаты",
    icon: MessageSquareText,
  },
  {
    href: "/wallet",
    label: "Кошелек",
    icon: Wallet,
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: UserRound,
  },
  {
    href: "/admin",
    label: "Админ",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
];

const Nav = ({
  role,
  mobile = false,
  onNavigate,
}: {
  role?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();

  return (
    <Stack
      direction={mobile ? "column" : "row"}
      spacing={1}
      alignItems={mobile ? "stretch" : "center"}
    >
      {NAV_ITEMS.filter(
        (item) => !item.roles || (role ? item.roles.includes(role) : false),
      ).map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            variant={isActive ? "soft" : "plain"}
            color={isActive ? "primary" : "neutral"}
            size="sm"
            fullWidth={mobile}
            onClick={onNavigate}
            startDecorator={<Icon size={16} />}
            sx={mobile ? { justifyContent: "flex-start" } : undefined}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );
};

export default Nav;
