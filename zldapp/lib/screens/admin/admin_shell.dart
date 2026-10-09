import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/supabase_service.dart';

class AdminShell extends StatefulWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  String _userRole = 'staff';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    final role = await SupabaseService.getUserRole();
    if (mounted) {
      setState(() => _userRole = role);
      
      // Redirect staff from dashboard to jobs
      if (role == 'staff' && GoRouterState.of(context).matchedLocation == '/admin/dashboard') {
        context.go('/admin/jobs');
      }
    }
  }

  List<({IconData icon, String label, String path})> get _tabs {
    // Staff only sees Jobs
    if (_userRole == 'staff') {
      return const [
        (icon: Icons.work_outline, label: 'Jobs', path: '/admin/jobs'),
      ];
    }
    
    // Admin/Manager see all tabs
    return const [
      (icon: Icons.dashboard_outlined, label: 'Dashboard', path: '/admin/dashboard'),
      (icon: Icons.people_outline, label: 'Customers', path: '/admin/customers'),
      (icon: Icons.design_services_outlined, label: 'Services', path: '/admin/services'),
      (icon: Icons.book_online_outlined, label: 'Bookings', path: '/admin/bookings'),
      (icon: Icons.work_outline, label: 'Jobs', path: '/admin/jobs'),
    ];
  }

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    final idx = _tabs.indexWhere((t) => loc.startsWith(t.path));
    return idx < 0 ? 0 : idx;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ZLD System'),
        actions: [
          // Hide menu for staff users
          if (_userRole != 'staff') PopupMenuButton<String>(
            icon: const Icon(Icons.menu),
            onSelected: (path) => context.go(path),
            itemBuilder: (_) => const [
              PopupMenuItem(value: '/admin/quotations', child: ListTile(leading: Icon(Icons.request_quote_outlined), title: Text('Quotations'), dense: true)),
              PopupMenuItem(value: '/admin/subscriptions', child: ListTile(leading: Icon(Icons.repeat), title: Text('Subscriptions'), dense: true)),
              PopupMenuItem(value: '/admin/staff', child: ListTile(leading: Icon(Icons.badge_outlined), title: Text('Staff'), dense: true)),
              PopupMenuItem(value: '/admin/inventory', child: ListTile(leading: Icon(Icons.inventory_2_outlined), title: Text('Inventory'), dense: true)),
              PopupMenuItem(value: '/admin/equipment', child: ListTile(leading: Icon(Icons.construction_outlined), title: Text('Equipment'), dense: true)),
              PopupMenuItem(value: '/admin/invoices', child: ListTile(leading: Icon(Icons.receipt_long_outlined), title: Text('Invoices'), dense: true)),
              PopupMenuItem(value: '/admin/payments', child: ListTile(leading: Icon(Icons.payments_outlined), title: Text('Payments'), dense: true)),
              PopupMenuItem(value: '/admin/reports', child: ListTile(leading: Icon(Icons.bar_chart_outlined), title: Text('Reports'), dense: true)),
              PopupMenuItem(value: '/admin/settings', child: ListTile(leading: Icon(Icons.settings_outlined), title: Text('Settings'), dense: true)),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await SupabaseService.signOut();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (i) => context.go(_tabs[i].path),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF28A8AC), // Teal/green color
        unselectedItemColor: Colors.grey,
        elevation: 8,
        items: _tabs.map((t) => BottomNavigationBarItem(icon: Icon(t.icon), label: t.label)).toList(),
      ),
    );
  }
}
