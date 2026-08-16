"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, FileText } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  ];

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 relative z-10">
              <Image 
                src="/logo.png" 
                alt="Service Portal Logo" 
                width={64} 
                height={64}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    selectedCategory === category
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={selectedCategory === category ? { backgroundColor: '#005555' } : undefined}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="text-left md:text-right">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-2" style={{ color: '#16797c' }}>
                Our Services
              </h2>
              <p className="text-sm text-gray-600">
                Choose from our range of professional services
              </p>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No services available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-sm text-gray-600">
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
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Zld Service Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/customer/track"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Track Order
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition"
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
      <div className="text-4xl font-bold text-gray-200 mb-4">{number}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
