import Link from "next/link";

const Nav = ({ role }: { role?: string }) => {
  return (
    <nav className="flex gap-3 items-center">
      <Link className="opacity-90 hover:opacity-100" href="/">
        Заказы
      </Link>
      <Link className="opacity-90 hover:opacity-100" href="/chats">
        Чаты
      </Link>
      <Link className="opacity-90 hover:opacity-100" href="/wallet">
        Кошелёк
      </Link>
      <Link className="opacity-90 hover:opacity-100" href="/profile">
        Профиль
      </Link>
      {role === "ADMIN" ? (
        <Link className="opacity-90 hover:opacity-100" href="/admin">
          Админ
        </Link>
      ) : null}
    </nav>
  );
};

export default Nav;
