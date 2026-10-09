import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/supabase_service.dart';
import '../../theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = SupabaseService.currentUser;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              const CircleAvatar(radius: 28, backgroundColor: AppTheme.primaryColor, child: Icon(Icons.person, color: Colors.white, size: 28)),
              const SizedBox(width: 16),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user?.email ?? 'Admin', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Text('Administrator', style: TextStyle(color: Colors.black54)),
                ],
              )),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        const _SectionTitle('Application'),
        _SettingsTile(icon: Icons.business, title: 'Company Name', subtitle: 'ZLD System'),
        _SettingsTile(icon: Icons.info_outline, title: 'Version', subtitle: '1.0.0'),
        const SizedBox(height: 8),
        const _SectionTitle('Navigation'),
        _SettingsTile(icon: Icons.people_outline, title: 'Customers', onTap: () => context.go('/admin/customers')),
        _SettingsTile(icon: Icons.design_services_outlined, title: 'Services', onTap: () => context.go('/admin/services')),
        _SettingsTile(icon: Icons.badge_outlined, title: 'Staff', onTap: () => context.go('/admin/staff')),
        _SettingsTile(icon: Icons.inventory_2_outlined, title: 'Inventory', onTap: () => context.go('/admin/inventory')),
        _SettingsTile(icon: Icons.construction_outlined, title: 'Equipment', onTap: () => context.go('/admin/equipment')),
        _SettingsTile(icon: Icons.bar_chart_outlined, title: 'Reports', onTap: () => context.go('/admin/reports')),
        const SizedBox(height: 8),
        const _SectionTitle('Account'),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.red),
          title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
          onTap: () async {
            await SupabaseService.signOut();
            if (context.mounted) context.go('/login');
          },
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black45, letterSpacing: 0.5)),
      );
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;
  const _SettingsTile({required this.icon, required this.title, this.subtitle, this.onTap});

  @override
  Widget build(BuildContext context) => ListTile(
        leading: Icon(icon, color: AppTheme.primaryColor),
        title: Text(title),
        subtitle: subtitle != null ? Text(subtitle!) : null,
        trailing: onTap != null ? const Icon(Icons.chevron_right) : null,
        onTap: onTap,
      );
}
