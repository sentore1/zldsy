import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'router.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL',
        defaultValue: 'https://ycngtmmoomwgmkabqasy.supabase.co'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY',
        defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDI4OTIsImV4cCI6MjEwMDIxODg5Mn0.PWonviWBfmIeqDS59dK9utINsL_KIZjjBHEAzaFuMXg'),
  );
  runApp(const ZldApp());
}

class ZldApp extends StatelessWidget {
  const ZldApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp.router(
        title: 'ZLD App',
        theme: AppTheme.theme,
        routerConfig: router,
        debugShowCheckedModeBanner: false,
      );
}
