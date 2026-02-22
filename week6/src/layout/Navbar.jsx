import { Outlet, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      <header>
        <nav className="mt-5">
          <Link className="h4 mt-5 mx-2" to="/">
            首頁
          </Link>
          <Link className="h4 mt-5 mx-2" to="/login">
            進入後台
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2025 我的網站</p>
      </footer>
    </div>
  );
};

export default Navbar;
