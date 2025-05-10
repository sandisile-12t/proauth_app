import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class InteractionHistoryScreen extends StatefulWidget {
  final String userId;
  final String role;

  const InteractionHistoryScreen({
    super.key,
    required this.userId,
    required this.role,
  });

  @override
  State<InteractionHistoryScreen> createState() => _InteractionHistoryScreenState();
}

class _InteractionHistoryScreenState extends State<InteractionHistoryScreen> {
  List<EnrichedRequest> allRequests = [];
  List<EnrichedRequest> filteredRequests = [];
  bool isLoading = true;

  String? selectedStatus;
  DateTime? selectedDate;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() => isLoading = true);

    // Debug: log incoming arguments
    print('🔍 Fetch history for userId=${widget.userId}, role=${widget.role}');

    try {
      final List<EnrichedRequest> enriched = [];
      late List<QueryDocumentSnapshot<Map<String, dynamic>>> requestDocs;

      final uid = widget.userId;
      final roleKey = widget.role.toLowerCase();

      if (roleKey == 'organ') {
        final tenderSnap = await FirebaseFirestore.instance
            .collection('tenders')
            .where('postedBy', isEqualTo: uid)
            .get();

        final tenderIds = tenderSnap.docs.map((e) => e.id).toList();
        if (tenderIds.isEmpty) {
          setState(() {
            allRequests = [];
            filteredRequests = [];
            isLoading = false;
          });
          return;
        }

        // Firestore 'in' supports max 10 items—batch into chunks
        final chunks = <List<String>>[];
        for (var i = 0; i < tenderIds.length; i += 10) {
          chunks.add(
            tenderIds.sublist(
              i,
              i + 10 > tenderIds.length ? tenderIds.length : i + 10,
            ),
          );
        }

        final allDocs = <QueryDocumentSnapshot<Map<String, dynamic>>>[];
        for (var chunk in chunks) {
          final snap = await FirebaseFirestore.instance
              .collection('requests')
              .where('bidId', whereIn: chunk)
              .get();
          allDocs.addAll(snap.docs);
        }
        requestDocs = allDocs;
      } else if (roleKey == 'company') {
        final requestSnap = await FirebaseFirestore.instance
            .collection('requests')
            .where('companyId', isEqualTo: uid)
            .get();
        requestDocs = requestSnap.docs;
      } else if (roleKey == 'personnel' || roleKey == 'user') {
        // Treat 'user' same as 'personnel'
        final requestSnap = await FirebaseFirestore.instance
            .collection('requests')
            .where('toUserId', isEqualTo: uid)
            .get();

        print('🔍 Found ${requestSnap.docs.length} request(s) for toUserId=$uid');
        requestDocs = requestSnap.docs;
      } else {
        requestDocs = [];
        print('⚠️ Unknown role "${widget.role}", no documents fetched.');
      }

      for (var doc in requestDocs) {
        final data = doc.data();
        String responderName = 'Unknown';

        if (roleKey == 'organ' || roleKey == 'personnel' || roleKey == 'user') {
          final companySnap = await FirebaseFirestore.instance
              .collection('company_users')
              .doc(data['companyId'])
              .get();
          responderName = companySnap.data()?['companyName'] ?? 'Unknown';
        }

        if (roleKey == 'organ') {
          enriched.add(EnrichedRequest(
            id: doc.id,
            data: {
              ...data,
              'responderName': responderName,
              'personnelName': data['personnelName'] ?? 'Unknown',
              'qualification': data['qualification'] ?? 'Unknown',
            },
          ));
        } else if (roleKey == 'personnel' || roleKey == 'user') {
          String organName = 'Unknown';
          if (data['organId'] != null) {
            final organSnap = await FirebaseFirestore.instance
                .collection('organs')
                .doc(data['organId'])
                .get();
            organName = organSnap.data()?['organName'] ?? 'Unknown';
          }

          enriched.add(EnrichedRequest(
            id: doc.id,
            data: {
              ...data,
              'responderName': responderName,
              'organName': organName,
              'personnelName': data['personnelName'] ?? 'Unknown',
              'qualification': data['qualification'] ?? 'Unknown',
              'bidDescription': data['bidDescription'] ?? 'No description',
            },
          ));
        } else if (roleKey == 'company') {
          enriched.add(EnrichedRequest(id: doc.id, data: data));
        }
      }

      setState(() {
        allRequests = enriched;
        filteredRequests = List.from(allRequests);
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error fetching history: $e")),
        );
      }
    }
  }

  void _applyFilters() {
    setState(() {
      filteredRequests = allRequests.where((req) {
        final data = req.data;
        final status = data['status']?.toString().toLowerCase();
        final timestamp = data['timestamp'];

        final statusMatch = selectedStatus == null || status == selectedStatus!.toLowerCase();
        final dateMatch = selectedDate == null ||
            (timestamp is Timestamp && _isSameDay(timestamp.toDate(), selectedDate!));

        return statusMatch && dateMatch;
      }).toList();
    });
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  void _clearFilters() {
    setState(() {
      selectedStatus = null;
      selectedDate = null;
      filteredRequests = List.from(allRequests);
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      setState(() => selectedDate = picked);
      _applyFilters();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interaction History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export Approved Requests',
            onPressed: _exportApprovedRequestsAsPDF,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                DropdownButton<String>(
                  hint: const Text('Filter by status'),
                  value: selectedStatus,
                  items: ['Pending', 'Approved', 'Declined']
                      .map((status) => DropdownMenuItem(
                    value: status,
                    child: Text(status),
                  ))
                      .toList(),
                  onChanged: (value) {
                    setState(() => selectedStatus = value);
                    _applyFilters();
                  },
                ),
                ElevatedButton(
                  onPressed: _pickDate,
                  child: Text(selectedDate == null
                      ? 'Filter by date'
                      : 'Date: ${selectedDate!.toLocal().toString().split(' ')[0]}'),
                ),
                TextButton(
                  onPressed: _clearFilters,
                  child: const Text('Clear Filters'),
                ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredRequests.isEmpty
                ? const Center(child: Text('No interaction history found.'))
                : ListView.builder(
              itemCount: filteredRequests.length,
              itemBuilder: (context, index) {
                final data = filteredRequests[index].data;
                return Card(
                  margin: const EdgeInsets.all(12),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDetail('Bid Number', data['bidNumber']),
                        if (widget.role.toLowerCase() != 'company')
                          _buildDetail('Company Requested Access', data['responderName']),
                        if (widget.role.toLowerCase() != 'personnel')
                          _buildDetail('Personnel Name', data['personnelName']),
                        if (widget.role.toLowerCase() != 'personnel')
                          _buildDetail('Qualification', data['qualification']),
                        _buildDetail('Request Details', data['bidDescription']),
                        _buildDetail('Status', data['status']),
                        _buildDetail(
                          'Response Date',
                          data['timestamp'] is Timestamp
                              ? _formatDate((data['timestamp'] as Timestamp).toDate())
                              : 'No response date available',
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _exportApprovedRequestsAsPDF() async {
    final pdfDoc = pw.Document();

    final approved = filteredRequests.where((req) =>
    req.data['status']?.toString().toLowerCase() == 'approved').toList();

    if (approved.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No approved requests to export.')),
      );
      return;
    }

    pdfDoc.addPage(
      pw.MultiPage(
        build: (_) => [
          pw.Text('Approved Requests Report',
              style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 20),
          ...approved.map((req) {
            final data = req.data;
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('Bid Number: ${data['bidNumber'] ?? 'N/A'}'),
                pw.Text('Responded By: ${data['responderName'] ?? 'N/A'}'),
                pw.Text('Personnel Name: ${data['personnelName'] ?? 'N/A'}'),
                pw.Text('Qualification: ${data['qualification'] ?? 'N/A'}'),
                pw.Text('Bid Description: ${data['bidDescription'] ?? 'N/A'}'),
                pw.Text('Status: ${data['status']}'),
                pw.Text('Response Date: ${data['timestamp'] is Timestamp ? _formatDate((data['timestamp'] as Timestamp).toDate()) : 'N/A'}'),
                pw.Divider(),
              ],
            );
          }).toList(),
        ],
      ),
    );

    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdfDoc.save());
  }

  Widget _buildDetail(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: Text('$title:',
                style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(
            flex: 5,
            child: Text((value?.isNotEmpty ?? false) ? value! : 'No details available'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} '
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

class EnrichedRequest {
  final String id;
  final Map<String, dynamic> data;

  EnrichedRequest({required this.id, required this.data});
}



























