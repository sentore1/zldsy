import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';
import 'add_booking_screen.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});
  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<Booking> _all = [], _filtered = [];
  String _statusFilter = 'all';
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getBookings();
      if (mounted) setState(() { _all = data; _applyFilter(); _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _applyFilter() {
    _filtered = _statusFilter == 'all' ? _all : _all.where((b) => b.status == _statusFilter).toList();
  }

  String statusLabel(String status) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  Future<void> _updateStatus(Booking b, String status) async {
    await SupabaseService.updateBookingStatus(b.id, status);
    _load();
  }

  Future<void> _navigateToAddBooking() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const AddBookingScreen()),
    );
    if (result == true) {
      _load(); // Refresh the list after adding a booking
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('d MMM yyyy');
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToAddBooking,
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Booking'),
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: ['all', 'pending', 'confirmed', 'cancelled'].map((s) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(s == 'all' ? 'All' : statusLabel(s)),
                  selected: _statusFilter == s,
                  onSelected: (_) => setState(() { _statusFilter = s; _applyFilter(); }),
                ),
              )).toList(),
            ),
          ),
          Expanded(
            child: _loading
                ? const LoadingWidget()
                : _filtered.isEmpty
                    ? const EmptyWidget(message: 'No bookings found', icon: Icons.book_online_outlined)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 80),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final b = _filtered[i];
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              child: ListTile(
                                title: Text(b.customer?.name ?? 'Unknown'),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(b.service?.name ?? 'Unknown Service'),
                                    Text(fmt.format(b.bookingDate), style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                  ],
                                ),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    StatusBadge(b.status),
                                    if (b.status == 'pending')
                                      TextButton(
                                        onPressed: () => _updateStatus(b, 'confirmed'),
                                        style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 24)),
                                        child: const Text('Confirm', style: TextStyle(fontSize: 12)),
                                      ),
                                  ],
                                ),
                                isThreeLine: true,
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
