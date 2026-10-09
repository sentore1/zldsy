/// App configuration constants
class AppConstants {
  // API Configuration
  // Android Emulator: Try both 10.0.2.2 and your computer's actual IP
  // Current WiFi IP: 10.20.20.133
  // If 10.0.2.2 doesn't work, uncomment the line below:
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.20.20.133:3000', // Your computer's WiFi IP
  );

  // API Endpoints
  static const String bookingsEndpoint = '$apiBaseUrl/api/bookings';
  static const String trackEndpoint = '$apiBaseUrl/api/track';
  static const String feedbackEndpoint = '$apiBaseUrl/api/feedback';
  static const String customersEndpoint = '$apiBaseUrl/api/customers';
  static const String servicesEndpoint = '$apiBaseUrl/api/services';
  static const String jobsEndpoint = '$apiBaseUrl/api/jobs';
  static const String invoicesEndpoint = '$apiBaseUrl/api/invoices';

  // Supabase Configuration (for auth and direct queries where needed)
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://ycngtmmoomwgmkabqasy.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDI4OTIsImV4cCI6MjEwMDIxODg5Mn0.PWonviWBfmIeqDS59dK9utINsL_KIZjjBHEAzaFuMXg',
  );
}
