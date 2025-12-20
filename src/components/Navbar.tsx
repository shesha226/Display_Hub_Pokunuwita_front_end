import { Link } from "react-router-dom";

const navbar = [
    {name:"Customers",path:"/customers"},
  { name: "Orders", path: "/orders" },
    { name: "Accessories", path: "/Accessories" },
    { name: "Repairs", path: "/Repairs" },
    { name: "Payments", path: "/Payments" },
  { name: "Reports", path: "/Reports" },
  { name: "Users", path: "/Users" },
  

  
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-6 mx-auto">
            {navbar.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
