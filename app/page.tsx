"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Loader2, 
  FileText, 
  Sparkles, 
  Wrench, 
  TreeDeciduous, 
  Truck,
  SprayCan,
  Home as HomeIcon,
  PackageOpen
} from "lucide-react";

// Format currency for better readability
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return amount.toString();
}

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  min_price: number | null;
  max_price: number | null;
  display_price_type: 'single' | 'range';
  unit: string;
  category: string;
  image_url: string | null;
  is_active: boolean;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        // API returns { services: [...] }
        const servicesArray = data.services || [];
        setServices(servicesArray.filter((s: Service) => s.is_active));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique categories (excluding "All")
  const categories = Array.from(new Set(services.map((s) => s.category)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Group services by category
  const servicesByCategory = categories.reduce((acc, category) => {
    acc[category] = services.filter((s) => s.category === category);
    return acc;
  }, {} as Record<string, Service[]>);

  // Category icons mapping - using real descriptive icons
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    
    // Cleaning and Fumigation - use spray can
    if (lowerCategory.includes('cleaning') || lowerCategory.includes('fumigation')) {
      return <SprayCan className="w-6 h-6" />;
    }
    
    // Maintenance and Renovations - use wrench/tools
    if (lowerCategory.includes('maintenance') || lowerCategory.includes('renovation')) {
      return <Wrench className="w-6 h-6" />;
    }
    
    // Gardening and Landscaping - use tree
    if (lowerCategory.includes('garden') || lowerCategory.includes('landscaping')) {
      return <TreeDeciduous className="w-6 h-6" />;
    }
    
    // Moving and Property Management - use truck
    if (lowerCategory.includes('moving') || lowerCategory.includes('property')) {
      return <Truck className="w-6 h-6" />;
    }
    
    // Default fallback
    return <HomeIcon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 relative z-10">
              <Image 
                src="/logo.png" 
                alt="Service Portal Logo" 
                width={100} 
                height={100}
                className="object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">
                Service Portal
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/customer/track"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Track Order
              </Link>
              <Link
                href="/login"
                className="text-sm px-4 py-2 text-white rounded transition" style={{ backgroundColor: '#005555' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor='#145456')} onMouseLeave={e => (e.currentTarget.style.backgroundColor='#005555')}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="pb-12 pt-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-right">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">
              Our Services
            </h2>
            <p className="text-gray-600">
              Professional services organized by category
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No services available</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Loop through each category */}
              {categories.map((category) => (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: '#005555' }}
                      >
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {servicesByCategory[category].length} service{servicesByCategory[category].length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 hidden md:block"></div>
                  </div>

                  {/* Services Grid for this Category */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {servicesByCategory[category].map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 border-t border-gray-200" style={{ backgroundColor: '#2EA5AB' }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-sm text-white opacity-90">
              Simple process to get your service completed
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <Step
              number="01"
              title="Choose Service"
              description="Browse and select the service you need from our catalog"
            />
            <Step
              number="02"
              title="Book Online"
              description="Fill in your details and preferred date for service"
            />
            <Step
              number="03"
              title="Get Quote"
              description="Receive instant quotation and confirmation via email"
            />
            <Step
              number="04"
              title="Service Complete"
              description="Our professional team completes the job to your satisfaction"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200" style={{ backgroundColor: '#2EA5AB' }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white">
              © 2026 Zld Service Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/customer/track"
                className="text-sm text-white hover:text-gray-100 transition"
              >
                Track Order
              </Link>
              <Link
                href="/login"
                className="text-sm text-white hover:text-gray-100 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const getPriceDisplay = () => {
    if (service.display_price_type === 'range' && service.min_price && service.max_price) {
      return `${formatCurrency(service.min_price)} - ${formatCurrency(service.max_price)}`;
    }
    return formatCurrency(service.base_price);
  };

  return (
    <div className="group border border-gray-200 rounded-lg hover:border-gray-300 transition overflow-hidden bg-white flex flex-col h-full">
      {/* Service Image */}
      {service.image_url && (
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden flex-shrink-0">
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
              {service.category}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {service.name}
            </h3>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed min-h-[40px]">
          {service.description}
        </p>

        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                {getPriceDisplay()} <span className="text-sm font-normal text-gray-600">Rwf</span>
              </span>
              <span className="text-xs text-gray-500">/ {service.unit}</span>
            </div>
            {service.display_price_type === 'range' && (
              <span className="text-xs text-gray-500 mt-1 block">Price range based on requirements</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <Link
            href={`/customer/booking?service=${service.id}&requestQuote=true`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded hover:bg-gray-50 transition"
            style={{ color: '#28A8AC' }}
          >
            Get Quote
            <FileText className="w-4 h-4" />
          </Link>
          
          <Link
            href={`/customer/booking?service=${service.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-white text-sm rounded hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: '#28A8AC' }}
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-4xl font-bold text-white opacity-30 mb-4">{number}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white opacity-90 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
