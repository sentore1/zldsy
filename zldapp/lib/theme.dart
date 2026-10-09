import 'package:flutter/material.dart';

class AppTheme {
  static const primaryColor = Color(0xFF28A8AC); // teal/turquoise - matching web app
  static const secondaryColor = Color(0xFF239095); // darker teal for hover
  static const successColor = Color(0xFF16A34A);
  static const warningColor = Color(0xFFD97706);
  static const errorColor = Color(0xFFDC2626);
  static const bgColor = Color(0xFFF8FAFC);

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: bgColor,
        appBarTheme: const AppBarTheme(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          color: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          filled: true,
          fillColor: Colors.white,
          hintStyle: TextStyle(color: Colors.grey.shade600),
        ),
        chipTheme: ChipThemeData(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      );
}

Color statusColor(String status) {
  switch (status.toLowerCase()) {
    case 'pending': return const Color(0xFFD97706);
    case 'confirmed':
    case 'scheduled':
    case 'accepted': return const Color(0xFF2563EB);
    case 'in_progress': return const Color(0xFF7C3AED);
    case 'completed':
    case 'paid': return const Color(0xFF16A34A);
    case 'cancelled':
    case 'rejected':
    case 'overdue': return const Color(0xFFDC2626);
    case 'sent': return const Color(0xFF0891B2);
    case 'expired': return const Color(0xFF6B7280);
    default: return const Color(0xFF6B7280);
  }
}

String statusLabel(String status) => status.replaceAll('_', ' ').toUpperCase();
