import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';
import 'job_detail_screen.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});
  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  List<Job> _all = [], _filtered = [];
  String _statusFilter = 'all';
  bool _loading = true;
  String _userRole = 'staff';
  String? _staffId;

  @override
  void initState() { 
    super.initState(); 
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    final role = await SupabaseService.getUserRole();
    setState(() => _userRole = role);
    
    // If staff, get their staff ID
    if (role == 'staff') {
      final email = SupabaseService.currentUser?.email;
      if (email != null) {
        final staffId = await SupabaseService.getStaffIdByEmail(email);
        setState(() => _staffId = staffId);
      }
    }
    
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      // Pass staffId for staff users, null for admin/manager
      final data = await SupabaseService.getJobs(
        staffId: _userRole == 'staff' ? _staffId : null,
      );
      if (mounted) setState(() { _all = data; _applyFilter(); _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _applyFilter() {
    _filtered = _statusFilter == 'all' ? _all : _all.where((j) => j.status == _statusFilter).toList();
  }

  Future<void> _updateStatus(Job job) async {
    String? weather;
    String? newStatus;

    final statuses = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];
    final current = statuses.indexOf(job.status);
    if (current < 0 || current >= statuses.length - 1) return;

    newStatus = await showDialog<String>(
      context: context,
      builder: (_) => SimpleDialog(
        title: const Text('Update Status'),
        children: statuses.skip(current + 1).map((s) => SimpleDialogOption(
          onPressed: () => Navigator.pop(context, s),
          child: StatusBadge(s),
        )).toList(),
      ),
    );
    if (newStatus == null) return;

    if (newStatus == 'in_progress') {
      weather = await showDialog<String>(
        context: context,
        builder: (_) => SimpleDialog(
          title: const Text('Weather Condition'),
          children: ['dry', 'wet', 'rain'].map((w) => SimpleDialogOption(
            onPressed: () => Navigator.pop(context, w),
            child: Text(w.toUpperCase()),
          )).toList(),
        ),
      );
    }

    await SupabaseService.updateJobStatus(job.id, newStatus, weatherCondition: weather);
    _load();
  }

  void _showDetail(Job job) {
    final fmt = DateFormat('d MMM yyyy, h:mm a');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(job.jobNumber, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  StatusBadge(job.status),
                ]),
                const SizedBox(height: 8),
                if (job.scheduledDate != null) Text('Scheduled: ${fmt.format(job.scheduledDate!)}'),
                if (job.weatherCondition != null) Text('Weather: ${job.weatherCondition!.toUpperCase()}'),
                if (job.notes != null) Text('Notes: ${job.notes}'),
                const Divider(height: 20),
                const Text('Assigned Staff', style: TextStyle(fontWeight: FontWeight.bold)),
                ...job.staff.map((s) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.person_outline),
                  title: Text(s.staff?.name ?? 'Unknown'),
                  subtitle: Text(s.role ?? ''),
                  contentPadding: EdgeInsets.zero,
                )),
                if (job.staff.isEmpty) const Text('No staff assigned', style: TextStyle(color: Colors.black45)),
                const SizedBox(height: 12),
                if (_userRole != 'staff') SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => JobDetailScreen(jobId: job.id),
                        ),
                      );
                    },
                    icon: const Icon(Icons.assessment),
                    label: const Text('View Details & Costs'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                  ),
                ),
                if (_userRole != 'staff') const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () { Navigator.pop(context); _updateStatus(job); },
                    child: const Text('Update Status'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('d MMM yyyy');
    return Scaffold(
      floatingActionButton: _userRole != 'staff' ? FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Jobs are created from confirmed bookings. Confirm a booking first.'),
              duration: Duration(seconds: 4),
            ),
          );
        },
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Job'),
      ) : null,
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: ['all', 'pending', 'scheduled', 'in_progress', 'completed'].map((s) => Padding(
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
                    ? const EmptyWidget(message: 'No jobs found', icon: Icons.work_outline)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 80),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final j = _filtered[i];
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              child: ListTile(
                                onTap: () => _showDetail(j),
                                leading: CircleAvatar(
                                  backgroundColor: statusColor(j.status).withOpacity(0.15),
                                  child: Icon(Icons.work_outline, color: statusColor(j.status)),
                                ),
                                title: Text(j.jobNumber),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (j.scheduledDate != null) Text(fmt.format(j.scheduledDate!)),
                                    Text('${j.staff.length} staff assigned', style: const TextStyle(fontSize: 12)),
                                  ],
                                ),
                                trailing: StatusBadge(j.status),
                                isThreeLine: j.scheduledDate != null,
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
