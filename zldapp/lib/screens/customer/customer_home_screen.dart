import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class CustomerHomeScreen extends StatefulWidget {
  const CustomerHomeScreen({super.key});
  @override
  State<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends State<CustomerHomeScreen> {
  List<Service> _services = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getServices(activeOnly: true);
      if (mounted) setState(() { _services = data; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    return Scaffold(
      appBar: AppBar(
        title: Image.asset(
          'assets/images/logowhite.png',
          height: 32,
          fit: BoxFit.contain,
        ),
        actions: [
          TextButton.icon(
            onPressed: () => context.go('/customer/track'),
            icon: const Icon(Icons.track_changes, color: Colors.white),
            label: const Text('Track', style: TextStyle(color: Colors.white)),
          ),
          TextButton.icon(
            onPressed: () => context.go('/login'),
            icon: const Icon(Icons.login, color: Colors.white),
            label: const Text('Login', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: _loading
          ? const LoadingWidget()
          : RefreshIndicator(
              onRefresh: _load,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Professional Services', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Book a service today', style: TextStyle(color: Colors.white70)),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () => context.go('/customer/booking'),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.primaryColor),
                            icon: const Icon(Icons.add_circle_outline),
                            label: const Text('Book Now'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverToBoxAdapter(
                      child: const Text('Our Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: _services.isEmpty
                        ? const SliverToBoxAdapter(child: EmptyWidget(message: 'No services available'))
                        : SliverGrid(
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 0.68, // Increased height to prevent overflow
                            ),
                            delegate: SliverChildBuilderDelegate(
                              (_, i) {
                                final s = _services[i];
                                return Card(
                                  clipBehavior: Clip.antiAlias,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Service Image - Reduced height for small screens
                                      if (s.imageUrl != null && s.imageUrl!.isNotEmpty)
                                        Container(
                                          height: 90, // Reduced from 100
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: Colors.grey[200],
                                          ),
                                          child: Image.network(
                                            s.imageUrl!,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) {
                                              return const Center(
                                                child: Icon(Icons.design_services, size: 32, color: AppTheme.primaryColor),
                                              );
                                            },
                                            loadingBuilder: (context, child, loadingProgress) {
                                              if (loadingProgress == null) return child;
                                              return Center(
                                                child: CircularProgressIndicator(
                                                  value: loadingProgress.expectedTotalBytes != null
                                                      ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                                      : null,
                                                  strokeWidth: 2,
                                                ),
                                              );
                                            },
                                          ),
                                        )
                                      else
                                        Container(
                                          height: 90, // Reduced from 100
                                          width: double.infinity,
                                          color: Colors.grey[100],
                                          child: const Center(
                                            child: Icon(Icons.design_services, size: 32, color: AppTheme.primaryColor),
                                          ),
                                        ),
                                      // Service Details
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                              if (s.description != null && s.description!.isNotEmpty) ...[
                                                const SizedBox(height: 2),
                                                Text(
                                                  s.description!,
                                                  style: const TextStyle(fontSize: 10, color: Colors.black54),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                              const Spacer(),
                                              Text('From ${fmt.format(s.basePrice)}', style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600, fontSize: 12)),
                                              if (s.unit != null) Text('per ${s.unit!}', style: const TextStyle(fontSize: 9, color: Colors.black45)),
                                              const SizedBox(height: 6),
                                              Row(
                                                children: [
                                                  Expanded(
                                                    child: OutlinedButton(
                                                      onPressed: () => context.go('/customer/booking?service=${s.id}&requestQuote=true'),
                                                      style: OutlinedButton.styleFrom(
                                                        foregroundColor: AppTheme.primaryColor,
                                                        side: const BorderSide(color: AppTheme.primaryColor, width: 1),
                                                        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                                                        minimumSize: const Size(0, 32),
                                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                      ),
                                                      child: const Text('Quote', style: TextStyle(fontSize: 10)),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Expanded(
                                                    child: ElevatedButton(
                                                      onPressed: () => context.go('/customer/booking?service=${s.id}'),
                                                      style: ElevatedButton.styleFrom(
                                                        backgroundColor: AppTheme.primaryColor,
                                                        foregroundColor: Colors.white,
                                                        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                                                        minimumSize: const Size(0, 32),
                                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                      ),
                                                      child: const Text('Book', style: TextStyle(fontSize: 10)),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                              childCount: _services.length,
                            ),
                          ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 24)),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/customer/booking'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Book Service'),
      ),
    );
  }
}
