import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/src/assets/tasktrail-logo.svg" 
            alt="TaskTrail Logo" 
            className="w-16 h-16 drop-shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-secondary mb-4">Oops! Page not found</p>
        <a 
          href="/" 
          className="text-accent-primary hover:text-accent-hover underline transition-colors"
        >
          Return to TaskTrail
        </a>
      </div>
    </div>
  );
};

export default NotFound;