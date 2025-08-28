import { Link } from 'react-router-dom';

function FooterComponent(){
    return (
        <footer className=" bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-8 mb-6">
            <Link to={"/Home"} className="hover:text-blue-400 transition-colors">Home</Link>
            <Link to={"/Products"} className="hover:text-blue-400 transition-colors">Products</Link>
            <Link to={"/AboutUs"} className="hover:text-blue-400 transition-colors">About Us</Link>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-sm text-gray-400 space-y-1">
            <p>Email: contact@company.com</p>
            <p>Phone: +84 123 456 789</p>
            <p>Address: Hồ Chí Minh City, Vietnam</p>
            <p className="mt-4">© 2025 Company Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
}
export default FooterComponent;