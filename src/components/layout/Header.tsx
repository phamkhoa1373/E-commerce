import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { TOKEN_KEY, USER_KEY } from "../../common/constant";
import SearchBarComponent from "./SearchBar";
import { getCart } from "@/services/api";
import userIcon from "@/assets/icons8-user-100.png";
import cartIcon from "@/assets/icons8-cart-80.png";
import { useCart } from "@/hooks";

function HeaderComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { currentCart, setCurrentCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem(USER_KEY);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    setIsLoggedIn(!!token);

    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      const data = await getCart(userId!);

      setCurrentCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setCurrentCart([]);
    navigate("/");
  };

  const isAtLoginRegister =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 h-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-4xl font-bold text-blue-500 hover:text-gray-700 transition-colors"
          >
            Shop
          </Link>

          {!isAtLoginRegister && <SearchBarComponent />}

          <div className="flex items-center space-x-4">
            {!isAtLoginRegister && (
              <Link to="/cart" className="relative">
                <img
                  src={cartIcon}
                  alt="cart"
                  className="size-10 rounded hover:bg-slate-100"
                />
                {currentCart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {currentCart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <img
                  src={userIcon}
                  alt="user"
                  className="size-8 border-2 border-gray-400 rounded-full"
                />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-black font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
