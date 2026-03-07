import { Outlet } from "react-router"
import { Link } from "react-router-dom";

function FrontendLayout() {
    return (
        <>
            <header>
                <ul className="nav">
                    <li className="nav-item">
                        <Link className="nav-link " 
                         to="/">home</Link>
                    </li>
                     <li className="nav-item">
                        <Link className="nav-link " 
                         to="/Products">產品列表頁</Link>
                    </li>
                     <li className="nav-item">
                        <Link className="nav-link" 
                         to="/Cart">購物車</Link>
                    </li>  
                </ul>
            </header>
            <main>

                <Outlet />
            </main>
            <footer>2026 © Your Company</footer>
        </>
    )
}

export default FrontendLayout
