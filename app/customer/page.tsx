"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  category: string;
  is_active: boolean;
}

export default function CustomerPage() {
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

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="border border-gray-200 rounded-lg p-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Our Services
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Book professional services with ease. Track your service progress in
          real-time.
        </p>
        <Link
          href="/customer/booking"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
        >
          Book a Service Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/customer/booking"
          className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition group"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
            Book a Service
          </h3>
          <p className="text-gray-600 mb-4">
            Schedule a service at your preferred date and time
          </p>
          <span className="inline-flex items-center gap-2 text-gray-900 font-medium">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          href="/customer/track"
          className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition group"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
            Track Service
          </h3>
          <p className="text-gray-600 mb-4">
            Monitor the progress of your booked services
          </p>
          <span className="inline-flex items-center gap-2 text-gray-900 font-medium">
            Track Now
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Services Grid */}
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our Services
          </h2>
          <p className="text-gray-600">
            Choose from our range of professional services
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 rounded-lg">
            <p className="text-gray-500">No services available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature
            title="Professional Team"
            description="Highly trained and experienced staff"
          />
          <Feature
            title="Quality Service"
            description="We guarantee satisfaction on every job"
          />
          <Feature
            title="Flexible Scheduling"
            description="Book at your convenience, 7 days a week"
          />
          <Feature
            title="Real-time Tracking"
            description="Monitor your service progress live"
          />
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="border border-gray-200 rounded-lg hover:border-gray-300 transition overflow-hidden">
      <div className="p-6">
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-3">
            {service.category}
          </span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {service.name}
          </h3>
        </div>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed min-h-[48px]">
          {service.description}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                RWF {service.base_price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/ {service.unit}</span>
            </div>
          </div>

          <Link
            href={`/customer/booking?service=${service.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition"
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
