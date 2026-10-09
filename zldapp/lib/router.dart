import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/admin/admin_shell.dart';
import 'screens/admin/dashboard_screen.dart';
import 'screens/admin/customers_screen.dart';
import 'screens/admin/services_screen.dart';
import 'screens/admin/bookings_screen.dart';
import 'screens/admin/quotations_screen.dart';
import 'screens/admin/jobs_screen.dart';
import 'screens/admin/staff_screen.dart';
import 'screens/admin/inventory_screen.dart';
import 'screens/admin/equipment_screen.dart';
import 'screens/admin/invoices_screen.dart';
import 'screens/admin/payments_screen.dart';
import 'screens/admin/subscriptions_screen.dart';
import 'screens/admin/reports_screen.dart';
import 'screens/admin/settings_screen.dart';
import 'screens/customer/customer_home_screen.dart';
import 'screens/customer/booking_screen.dart';
import 'screens/customer/track_screen.dart';
import 'screens/customer/quotation_view_screen.dart';
import 'screens/customer/feedback_screen.dart';
import 'services/supabase_service.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootKey,
  initialLocation: '/onboarding',
  redirect: (context, state) {
    final loggedIn = SupabaseService.currentUser != null;
    final isLoginPage = state.matchedLocation == '/login';
    final isOnboarding = state.matchedLocation == '/onboarding';
    final isCustomerRoute = state.matchedLocation.startsWith('/customer');
    
    // If not logged in and trying to access admin routes, redirect to login
    if (!loggedIn && !isLoginPage && !isCustomerRoute && !isOnboarding) {
      return '/login';
    }
    
    // If logged in and on login/onboarding page, redirect to dashboard
    if (loggedIn && (isLoginPage || isOnboarding)) {
      return '/admin/dashboard';
    }
    
    return null;
  },
  routes: [
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    // Customer portal (no auth required)
    GoRoute(path: '/customer', builder: (_, __) => const CustomerHomeScreen()),
    GoRoute(path: '/customer/booking', builder: (_, __) => const BookingScreen()),
    GoRoute(path: '/customer/track', builder: (_, __) => const TrackScreen()),
    GoRoute(
      path: '/customer/quotation/:id',
      builder: (_, state) => QuotationViewScreen(id: state.pathParameters['id']!),
    ),
    GoRoute(
      path: '/customer/feedback/:jobId',
      builder: (_, state) => FeedbackScreen(jobId: state.pathParameters['jobId']!),
    ),
    GoRoute(
      path: '/customer/feedback/booking/:bookingId',
      builder: (_, state) => FeedbackScreen(bookingId: state.pathParameters['bookingId']!),
    ),
    // Admin shell with bottom nav
    ShellRoute(
      navigatorKey: _shellKey,
      builder: (_, __, child) => AdminShell(child: child),
      routes: [
        GoRoute(path: '/admin', redirect: (_, __) => '/admin/dashboard'),
        GoRoute(path: '/admin/dashboard', builder: (_, __) => const DashboardScreen()),
        GoRoute(path: '/admin/customers', builder: (_, __) => const CustomersScreen()),
        GoRoute(path: '/admin/services', builder: (_, __) => const ServicesScreen()),
        GoRoute(path: '/admin/bookings', builder: (_, __) => const BookingsScreen()),
        GoRoute(path: '/admin/quotations', builder: (_, __) => const QuotationsScreen()),
        GoRoute(path: '/admin/jobs', builder: (_, __) => const JobsScreen()),
        GoRoute(path: '/admin/staff', builder: (_, __) => const StaffScreen()),
        GoRoute(path: '/admin/inventory', builder: (_, __) => const InventoryScreen()),
        GoRoute(path: '/admin/equipment', builder: (_, __) => const EquipmentScreen()),
        GoRoute(path: '/admin/invoices', builder: (_, __) => const InvoicesScreen()),
        GoRoute(path: '/admin/payments', builder: (_, __) => const PaymentsScreen()),
        GoRoute(path: '/admin/subscriptions', builder: (_, __) => const SubscriptionsScreen()),
        GoRoute(path: '/admin/reports', builder: (_, __) => const ReportsScreen()),
        GoRoute(path: '/admin/settings', builder: (_, __) => const SettingsScreen()),
      ],
    ),
  ],
);
