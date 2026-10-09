import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';
import '../../utils/pdf_helper.dart';
import '../../utils/whatsapp_helper.dart';

class InvoicesScreen extends StatefulWidget {
  const InvoicesScreen({super.key});
  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  List<Invoice> _all = [], _filtered = [];
  String _statusFilter = 'all';
  bool _loading = true;

  /// Tracks which invoice id is currently generating a PDF.
  String? _downloadingId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getInvoices();
      if (mounted) {
        setState(() {
          _all = data;
          _applyFilter();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyFilter() {
    _filtered = _statusFilter == 'all'
        ? _all
        : _all.where((inv) => inv.status == _statusFilter).toList();
  }

  // ── PDF download ────────────────────────────────────────────────────────────
  Future<void> _downloadPdf(Invoice inv) async {
    if (_downloadingId != null) return;
    setState(() => _downloadingId = inv.id);
    try {
      await downloadInvoicePdf(inv);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate PDF: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _downloadingId = null);
    }
  }

  // ── WhatsApp share ──────────────────────────────────────────────────────────
  Future<void> _shareViaWhatsApp(Invoice inv) async {
    try {
      // Get customer details from job
      final jobData = await SupabaseService.supabase
          .from('jobs')
          .select('booking_id')
          .eq('id', inv.jobId)
          .single();
      
      final bookingData = await SupabaseService.supabase
          .from('bookings')
          .select('customer:customer_id(*)')
          .eq('id', jobData['booking_id'])
          .single();
      
      final customer = bookingData['customer'];
      
      await WhatsAppHelper.shareInvoice(
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: customer['name'] ?? 'Customer',
        customerPhone: customer['phone'],
        totalAmount: inv.finalAmount,
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Opening WhatsApp...'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // ── Generate invoice info dialog ────────────────────────────────────────────
  void _showGenerateInvoiceInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Generate Invoice'),
        content: const Text(
          'Invoices are automatically generated from completed jobs.\n\n'
          'To generate an invoice:\n'
          '1. Go to Jobs screen\n'
          '2. Open a completed job\n'
          '3. Click "View Details & Costs"\n'
          '4. Click "Generate Invoice" button\n\n'
          'The invoice will include all job costs: labor, materials, and equipment.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  // ── Create invoice form ─────────────────────────────────────────────────────
  Future<void> _showCreateInvoiceForm() async {
    final jobs = await SupabaseService.getJobs();
    if (!mounted) return;

    String? jobId;
    double totalAmount = 0.0;
    double taxAmount = 0.0;
    double discountAmount = 0.0;
    String dueDate =
        DateTime.now().add(const Duration(days: 30)).toIso8601String().substring(0, 10);

    final saved = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Create Invoice'),
        content: SingleChildScrollView(
          child: StatefulBuilder(
            builder: (context, setState) {
              double finalAmount = totalAmount + taxAmount - discountAmount;
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    value: jobId,
                    decoration:
                        const InputDecoration(labelText: 'Select Job *', isDense: true),
                    items: jobs
                        .map((j) => DropdownMenuItem(
                            value: j.id,
                            child: Text('${j.jobNumber} - ${j.staff.length} staff')))
                        .toList(),
                    onChanged: (v) => setState(() => jobId = v),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration: const InputDecoration(
                        labelText: 'Total Amount (RWF) *', isDense: true),
                    keyboardType: TextInputType.number,
                    onChanged: (v) =>
                        setState(() => totalAmount = double.tryParse(v) ?? 0),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Tax Amount (RWF)', isDense: true),
                    keyboardType: TextInputType.number,
                    onChanged: (v) =>
                        setState(() => taxAmount = double.tryParse(v) ?? 0),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration: const InputDecoration(
                        labelText: 'Discount Amount (RWF)', isDense: true),
                    keyboardType: TextInputType.number,
                    onChanged: (v) =>
                        setState(() => discountAmount = double.tryParse(v) ?? 0),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Final Amount:',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                          'RWF ${NumberFormat('#,##0.00').format(finalAmount)}',
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Due Date *', isDense: true),
                    readOnly: true,
                    controller: TextEditingController(text: dueDate),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate:
                            DateTime.now().add(const Duration(days: 30)),
                        firstDate: DateTime.now(),
                        lastDate:
                            DateTime.now().add(const Duration(days: 365)),
                      );
                      if (date != null) {
                        setState(() =>
                            dueDate = date.toIso8601String().substring(0, 10));
                      }
                    },
                  ),
                ],
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(dialogContext, rootNavigator: true).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (jobId == null || totalAmount <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content:
                        Text('Please select a job and enter an amount'),
                    backgroundColor: Colors.red));
                return;
              }
              try {
                double finalAmount =
                    totalAmount + taxAmount - discountAmount;
                await SupabaseService.supabase.from('invoices').insert({
                  'job_id': jobId,
                  'invoice_number':
                      'INV-${DateTime.now().millisecondsSinceEpoch}',
                  'total_amount': totalAmount,
                  'tax': taxAmount,
                  'discount': discountAmount,
                  'final_amount': finalAmount,
                  'due_date': dueDate,
                  'status': 'pending',
                });
                Navigator.of(dialogContext, rootNavigator: true).pop(true);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text('Error: $e'),
                        backgroundColor: Colors.red));
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
    if (saved == true) _load();
  }

  // ── Record payment ──────────────────────────────────────────────────────────
  Future<void> _recordPayment(Invoice inv) async {
    final amount = TextEditingController(text: inv.finalAmount.toString());
    String method = 'cash';

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          title: const Text('Record Payment'),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(
              controller: amount,
              decoration: const InputDecoration(labelText: 'Amount (RWF)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: method,
              decoration: const InputDecoration(labelText: 'Payment Method'),
              items: ['cash', 'bank_transfer', 'card', 'cheque']
                  .map((m) => DropdownMenuItem(
                      value: m,
                      child: Text(m.replaceAll('_', ' ').toUpperCase())))
                  .toList(),
              onChanged: (v) => setSt(() => method = v!),
            ),
          ]),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                await SupabaseService.recordPayment(inv.id, {
                  'amount':
                      double.tryParse(amount.text) ?? inv.finalAmount,
                  'payment_method': method,
                  'payment_date': DateTime.now().toIso8601String(),
                });
                if (ctx.mounted) Navigator.pop(ctx, true);
              },
              child: const Text('Record'),
            ),
          ],
        ),
      ),
    );
    if (ok == true) _load();
  }

  // ── Detail bottom sheet ──────────────────────────────────────────────────────
  void _showDetail(Invoice inv) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    final dateFmt = DateFormat('d MMM yyyy');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.92,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 12),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(inv.invoiceNumber,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
              StatusBadge(inv.status),
            ]),
            const SizedBox(height: 8),
            Text('Created: ${dateFmt.format(inv.createdAt)}'),
            if (inv.dueDate != null)
              Text('Due: ${dateFmt.format(inv.dueDate!)}'),
            if (inv.paidDate != null)
              Text('Paid: ${dateFmt.format(inv.paidDate!)}',
                  style: const TextStyle(color: Colors.green)),
            const Divider(height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [const Text('Subtotal'), Text(fmt.format(inv.totalAmount))]),
            if (inv.tax > 0)
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [const Text('Tax'), Text(fmt.format(inv.tax))]),
            if (inv.discount > 0)
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Discount'),
                Text('-${fmt.format(inv.discount)}')
              ]),
            const Divider(),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Total',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text(fmt.format(inv.finalAmount),
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF1E40AF))),
            ]),
            const SizedBox(height: 20),
            // Action buttons row
            Row(children: [
              // Download PDF
              Expanded(
                child: StatefulBuilder(builder: (context, setSt) {
                  final isLoading = _downloadingId == inv.id;
                  return ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: isLoading
                        ? null
                        : () async {
                            setSt(() {});
                            await _downloadPdf(inv);
                            setSt(() {});
                          },
                    icon: isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.download_rounded, size: 18),
                    label: Text(isLoading ? 'Generating…' : 'Download PDF',
                        style: const TextStyle(fontSize: 13)),
                  );
                }),
              ),
              const SizedBox(width: 10),
              // WhatsApp Share
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366), // WhatsApp green
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _shareViaWhatsApp(inv);
                  },
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('Share on WhatsApp',
                      style: TextStyle(fontSize: 13)),
                ),
              ),
            ]),
            if (inv.status != 'paid') ...[
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _recordPayment(inv);
                  },
                  icon: const Icon(Icons.payment, size: 18),
                  label: const Text('Record Payment',
                      style: TextStyle(fontSize: 13)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'paid': return Colors.green;
      case 'pending': return Colors.orange;
      case 'overdue': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateInvoiceForm,
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Create Invoice'),
      ),
      body: Column(
        children: [
          // Status filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: ['all', 'pending', 'paid', 'overdue']
                  .map((s) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(
                              s == 'all' ? 'All' : _statusLabel(s)),
                          selected: _statusFilter == s,
                          onSelected: (_) => setState(() {
                            _statusFilter = s;
                            _applyFilter();
                          }),
                        ),
                      ))
                  .toList(),
            ),
          ),
          Expanded(
            child: _loading
                ? const LoadingWidget()
                : _filtered.isEmpty
                    ? const EmptyWidget(
                        message: 'No invoices found',
                        icon: Icons.receipt_long_outlined)
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 80),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final inv = _filtered[i];
                            final isDownloading =
                                _downloadingId == inv.id;
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 4),
                              child: ListTile(
                                onTap: () => _showDetail(inv),
                                leading: CircleAvatar(
                                  backgroundColor: _statusColor(inv.status)
                                      .withOpacity(0.15),
                                  child: Icon(Icons.receipt_long_outlined,
                                      color: _statusColor(inv.status),
                                      size: 20),
                                ),
                                title: Text(inv.invoiceNumber),
                                subtitle: Text(DateFormat('d MMM yyyy')
                                    .format(inv.createdAt)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text(fmt.format(inv.finalAmount),
                                            style: const TextStyle(
                                                fontWeight:
                                                    FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        StatusBadge(inv.status),
                                      ],
                                    ),
                                    const SizedBox(width: 4),
                                    // Per-row download icon
                                    SizedBox(
                                      width: 36,
                                      height: 36,
                                      child: isDownloading
                                          ? const Padding(
                                              padding: EdgeInsets.all(8),
                                              child:
                                                  CircularProgressIndicator(
                                                strokeWidth: 2,
                                                color:
                                                    AppTheme.primaryColor,
                                              ),
                                            )
                                          : IconButton(
                                              icon: const Icon(
                                                  Icons.download_rounded,
                                                  size: 20),
                                              color: AppTheme.primaryColor,
                                              padding: EdgeInsets.zero,
                                              tooltip: 'Download PDF',
                                              onPressed: () =>
                                                  _downloadPdf(inv),
                                            ),
                                    ),
                                  ],
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
