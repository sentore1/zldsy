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
      _load();
    }
  }

  void _showBookingDetails(Booking booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _BookingDetailsSheet(
          booking: booking,
          scrollController: scrollController,
          onStatusUpdate: (status) {
            _updateStatus(booking, status);
            Navigator.pop(context);
          },
        ),
      ),
    );
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
          // Filter Chips
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
                  selectedColor: AppTheme.primaryColor.withOpacity(0.2),
                  labelStyle: TextStyle(
                    color: _statusFilter == s ? AppTheme.primaryColor : Colors.grey[700],
                    fontWeight: _statusFilter == s ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              )).toList(),
            ),
          ),
          
          // Bookings List
          Expanded(
            child: _loading
                ? const LoadingWidget()
                : _filtered.isEmpty
                    ? const EmptyWidget(message: 'No bookings found', icon: Icons.book_online_outlined)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 80, left: 12, right: 12, top: 4),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final b = _filtered[i];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: InkWell(
                                onTap: () => _showBookingDetails(b),
                                borderRadius: BorderRadius.circular(12),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Header Row
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  b.customer?.name ?? 'Unknown',
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  b.customer?.phone ?? '',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          StatusBadge(b.status),
                                        ],
                                      ),
                                      
                                      const Divider(height: 20),
                                      
                                      // Service Info
                                      Row(
                                        children: [
                                          Icon(Icons.design_services, size: 16, color: Colors.grey[600]),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              b.service?.name ?? 'Unknown Service',
                                              style: const TextStyle(fontSize: 14),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      
                                      // Booking Date
                                      Row(
                                        children: [
                                          Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Booked: ${fmt.format(b.bookingDate)}',
                                            style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      
                                      // Preferred Date
                                      if (b.preferredDate != null)
                                        Row(
                                          children: [
                                            Icon(Icons.event, size: 16, color: AppTheme.primaryColor),
                                            const SizedBox(width: 8),
                                            Text(
                                              'Preferred: ${fmt.format(b.preferredDate!)}',
                                              style: TextStyle(
                                                fontSize: 13,
                                                color: AppTheme.primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      
                                      // Notes (if any)
                                      if (b.notes != null && b.notes!.isNotEmpty) ...[
                                        const SizedBox(height: 12),
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[100],
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Icon(Icons.note, size: 14, color: Colors.grey[600]),
                                              const SizedBox(width: 6),
                                              Expanded(
                                                child: Text(
                                                  b.notes!,
                                                  style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                      
                                      // Quick Actions
                                      if (b.status == 'pending') ...[
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: ElevatedButton.icon(
                                                onPressed: () => _updateStatus(b, 'confirmed'),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.green,
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                                ),
                                                icon: const Icon(Icons.check_circle, size: 16),
                                                label: const Text('Confirm', style: TextStyle(fontSize: 13)),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: OutlinedButton.icon(
                                                onPressed: () => _updateStatus(b, 'cancelled'),
                                                style: OutlinedButton.styleFrom(
                                                  foregroundColor: Colors.red,
                                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                                ),
                                                icon: const Icon(Icons.cancel, size: 16),
                                                label: const Text('Cancel', style: TextStyle(fontSize: 13)),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
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

// Booking Details Bottom Sheet
class _BookingDetailsSheet extends StatelessWidget {
  final Booking booking;
  final ScrollController scrollController;
  final Function(String) onStatusUpdate;

  const _BookingDetailsSheet({
    required this.booking,
    required this.scrollController,
    required this.onStatusUpdate,
  });

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('d MMM yyyy');
    final timeFmt = DateFormat('h:mm a');
    
    return Container(
      padding: const EdgeInsets.all(24),
      child: ListView(
        controller: scrollController,
        children: [
          // Handle Bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          
          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Booking Details',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 8),
          StatusBadge(booking.status),
          const Divider(height: 32),
          
          // Customer Info
          _DetailSection(
            icon: Icons.person,
            title: 'Customer',
            children: [
              _DetailRow('Name', booking.customer?.name ?? 'N/A'),
              _DetailRow('Phone', booking.customer?.phone ?? 'N/A'),
              if (booking.customer?.email != null)
                _DetailRow('Email', booking.customer!.email!),
            ],
          ),
          
          // Service Info
          _DetailSection(
            icon: Icons.design_services,
            title: 'Service',
            children: [
              _DetailRow('Service', booking.service?.name ?? 'N/A'),
            ],
          ),
          
          // Dates
          _DetailSection(
            icon: Icons.calendar_today,
            title: 'Dates',
            children: [
              _DetailRow('Booking Date', fmt.format(booking.bookingDate)),
              if (booking.preferredDate != null)
                _DetailRow('Preferred Date', fmt.format(booking.preferredDate!)),
              _DetailRow('Created', '${fmt.format(booking.createdAt)} at ${timeFmt.format(booking.createdAt)}'),
            ],
          ),
          
          // Notes
          if (booking.notes != null && booking.notes!.isNotEmpty)
            _DetailSection(
              icon: Icons.note,
              title: 'Notes',
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(booking.notes!, style: const TextStyle(fontSize: 14)),
                ),
              ],
            ),
          
          const SizedBox(height: 24),
          
          // Actions
          if (booking.status == 'pending') ...[
            ElevatedButton.icon(
              onPressed: () => onStatusUpdate('confirmed'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
              ),
              icon: const Icon(Icons.check_circle),
              label: const Text('Confirm Booking'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => onStatusUpdate('cancelled'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                padding: const EdgeInsets.all(16),
              ),
              icon: const Icon(Icons.cancel),
              label: const Text('Cancel Booking'),
            ),
          ],
          
          if (booking.status == 'confirmed') ...[
            ElevatedButton.icon(
              onPressed: () => onStatusUpdate('completed'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
              ),
              icon: const Icon(Icons.check),
              label: const Text('Mark as Completed'),
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Widget> children;

  const _DetailSection({
    required this.icon,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: AppTheme.primaryColor),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...children,
        const SizedBox(height: 20),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

